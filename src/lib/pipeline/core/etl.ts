// ============================================================================
// ETL Orchestration Engine
// ============================================================================
// The core pipeline that runs connectors through the full ingestion cycle:
//   fetch → parse → normalize → validate → persist
//
// Can run a single connector or all registered connectors in sequence.
// Handles errors, retries, and status tracking for each phase.
// ============================================================================

import { IConnector } from '../connectors/base';
import { registry } from '../connectors/registry';
import {
  ConnectorResult,
  IngestionRun,
  IngestionError,
  IngestionStatus,
  RawSourcePayload,
} from '../domain/models';
import {
  insertIngestionRun,
  updateIngestionRun,
  insertRawPayload,
  persistConnectorResult,
  markConnectorSuccess,
  markConnectorFailure,
} from './persistence';
import { createLogger } from './logger';
import { createHash } from 'crypto';

const log = createLogger('ETL');

export interface ETLOptions {
  /** Max retries per phase (default: 1) */
  maxRetries?: number;
  /** Whether to store raw payloads (default: true) */
  storeRawPayloads?: boolean;
  /** Whether to skip persistence (dry run) (default: false) */
  dryRun?: boolean;
  /** Only run specific phases (default: all) */
  phases?: ('fetch' | 'parse' | 'normalize' | 'validate' | 'persist')[];
}

const DEFAULT_OPTIONS: Required<ETLOptions> = {
  maxRetries: 1,
  storeRawPayloads: true,
  dryRun: false,
  phases: ['fetch', 'parse', 'normalize', 'validate', 'persist'],
};

/**
 * Run the full ETL pipeline for a single connector.
 */
export async function runConnector(
  connector: IConnector,
  options: ETLOptions = {}
): Promise<ConnectorResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { sourceName, league } = connector.descriptor;

  const run: IngestionRun = {
    connectorName: sourceName,
    league,
    status: 'started',
    recordsFetched: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: [],
    warnings: [],
    startedAt: new Date(),
    completedAt: null,
    durationMs: null,
  };

  // Insert run record in DB (best-effort — pipeline works without DB too)
  let runId: number | null = null;
  try {
    runId = await insertIngestionRun(run);
  } catch (err) {
    log.warn('Could not insert ingestion run (DB may be unavailable)', { error: String(err) });
  }

  const updateRun = async (updates: Partial<IngestionRun>) => {
    Object.assign(run, updates);
    if (runId) {
      try { await updateIngestionRun(runId, updates); } catch { /* best-effort */ }
    }
  };

  log.info(`Starting ETL for ${sourceName} (${league})`, { options: opts });

  try {
    // ── Phase 1: FETCH ──
    await updateRun({ status: 'fetching' });
    log.info(`[${sourceName}] Fetching...`);

    const fetchResults = await withRetry(
      () => connector.fetch(),
      opts.maxRetries,
      'fetch',
      run
    );

    run.recordsFetched = fetchResults.length;
    log.info(`[${sourceName}] Fetched ${fetchResults.length} result(s)`);

    // Store raw payloads if enabled
    if (opts.storeRawPayloads && !opts.dryRun) {
      for (const result of fetchResults) {
        try {
          const hash = createHash('sha256').update(result.rawBody).digest('hex');
          await insertRawPayload({
            sourceName,
            sourceUrl: result.url,
            league,
            fetchedAt: result.fetchedAt,
            rawBody: result.rawBody,
            contentType: result.contentType,
            httpStatus: result.httpStatus,
            bodyHash: hash,
            bodySize: Buffer.byteLength(result.rawBody, 'utf8'),
          });
        } catch (err) {
          log.warn(`[${sourceName}] Could not store raw payload`, { error: String(err) });
        }
      }
    }

    if (fetchResults.length === 0) {
      await updateRun({ status: 'failed' });
      addError(run, 'fetch', 'No data fetched from source');
      return completeRun(run, 'failed', sourceName, runId);
    }

    // ── Phase 2: PARSE ──
    if (!opts.phases.includes('parse')) {
      return completeRun(run, 'partial', sourceName, runId);
    }
    await updateRun({ status: 'parsing' });
    log.info(`[${sourceName}] Parsing...`);

    const parsedRecords = await withRetry(
      () => connector.parse(fetchResults),
      opts.maxRetries,
      'parse',
      run
    );

    log.info(`[${sourceName}] Parsed ${parsedRecords.length} record(s)`);

    if (parsedRecords.length === 0) {
      addError(run, 'parse', 'Parser produced no records');
      return completeRun(run, 'failed', sourceName, runId);
    }

    // ── Phase 3: NORMALIZE ──
    if (!opts.phases.includes('normalize')) {
      return completeRun(run, 'partial', sourceName, runId);
    }
    await updateRun({ status: 'normalizing' });
    log.info(`[${sourceName}] Normalizing...`);

    const normalized = await withRetry(
      () => connector.normalize(parsedRecords),
      opts.maxRetries,
      'normalize',
      run
    );

    const totalNormalized = normalized.players.length + normalized.skaterStats.length + normalized.goalieStats.length;
    log.info(`[${sourceName}] Normalized: ${normalized.players.length} players, ${normalized.skaterStats.length} skater stats, ${normalized.goalieStats.length} goalie stats`);

    // ── Phase 4: VALIDATE ──
    if (!opts.phases.includes('validate')) {
      return completeRun(run, 'partial', sourceName, runId, normalized);
    }
    await updateRun({ status: 'validating' });
    log.info(`[${sourceName}] Validating...`);

    const validated = await connector.validate(normalized);

    const errorCount = validated.validationErrors.filter(e => e.level === 'error').length;
    const warnCount = validated.validationErrors.filter(e => e.level === 'warning').length;
    log.info(`[${sourceName}] Validation: ${errorCount} errors, ${warnCount} warnings`);

    if (errorCount > 0) {
      run.warnings.push(`${errorCount} validation errors found`);
    }

    // Filter out records that failed validation (errors, not warnings)
    const validPlayers = validated.players.filter(p => p.dataQuality.passedValidation);
    const validSkaterStats = validated.skaterStats.filter(s => s.dataQuality.passedValidation);
    const validGoalieStats = validated.goalieStats.filter(s => s.dataQuality.passedValidation);

    const skippedCount = (validated.players.length - validPlayers.length) +
      (validated.skaterStats.length - validSkaterStats.length) +
      (validated.goalieStats.length - validGoalieStats.length);
    run.recordsSkipped = skippedCount;

    // ── Phase 5: PERSIST ──
    if (!opts.phases.includes('persist') || opts.dryRun) {
      log.info(`[${sourceName}] ${opts.dryRun ? 'Dry run' : 'Skipping persist phase'}`);
      return completeRun(run, 'success', sourceName, runId, {
        players: validPlayers,
        skaterStats: validSkaterStats,
        goalieStats: validGoalieStats,
      });
    }

    await updateRun({ status: 'persisting' });
    log.info(`[${sourceName}] Persisting...`);

    const persistResult = await persistConnectorResult({
      players: validPlayers,
      skaterStats: validSkaterStats,
      goalieStats: validGoalieStats,
    });

    run.recordsInserted = persistResult.inserted;
    run.recordsUpdated = persistResult.updated;
    run.recordsSkipped += persistResult.skipped;

    log.info(`[${sourceName}] Persisted: ${persistResult.inserted} inserted, ${persistResult.updated} updated, ${persistResult.skipped} skipped`);

    return completeRun(run, 'success', sourceName, runId, {
      players: validPlayers,
      skaterStats: validSkaterStats,
      goalieStats: validGoalieStats,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`[${sourceName}] Pipeline failed`, { error: message });
    addError(run, 'fetch', message);
    return completeRun(run, 'failed', sourceName, runId);
  }
}

/**
 * Run ETL for all registered connectors, optionally filtered by league.
 */
export async function runAll(options: ETLOptions & {
  /** Only run connectors for these leagues */
  leagues?: string[];
  /** Max concurrent connectors (default: 3) */
  concurrency?: number;
} = {}): Promise<ConnectorResult[]> {
  const { leagues, concurrency = 3, ...etlOpts } = options;
  const connectorNames = registry.listNames();

  log.info(`Running ETL for ${connectorNames.length} connector(s)`, { leagues, concurrency });

  // Filter by league if specified
  const toRun = connectorNames.filter(name => {
    if (!leagues || leagues.length === 0) return true;
    const connector = registry.create(name);
    return leagues.includes(connector.descriptor.league);
  });

  // Run in batches for concurrency control
  const results: ConnectorResult[] = [];
  for (let i = 0; i < toRun.length; i += concurrency) {
    const batch = toRun.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(name => {
        const connector = registry.create(name);
        return runConnector(connector, etlOpts);
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        log.error('Connector batch item failed', { error: String(result.reason) });
      }
    }
  }

  const succeeded = results.filter(r => r.run.status === 'success').length;
  const failed = results.filter(r => r.run.status === 'failed').length;
  log.info(`ETL complete: ${succeeded} succeeded, ${failed} failed out of ${toRun.length}`);

  return results;
}

/**
 * Run a single connector by name.
 */
export async function runByName(
  connectorName: string,
  options: ETLOptions = {}
): Promise<ConnectorResult> {
  const connector = registry.create(connectorName);
  return runConnector(connector, options);
}

// --- Helpers ---

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  phase: IngestionError['phase'],
  run: IngestionRun
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);
        log.warn(`[${run.connectorName}] ${phase} attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
          error: String(err),
        });
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  addError(run, phase, `Failed after ${maxRetries + 1} attempts: ${String(lastError)}`);
  throw lastError;
}

function addError(run: IngestionRun, phase: IngestionError['phase'], message: string, details?: unknown): void {
  run.errors.push({ phase, message, details, timestamp: new Date() });
}

async function completeRun(
  run: IngestionRun,
  status: IngestionStatus,
  connectorName: string,
  runId: number | null,
  data?: {
    players: import('../domain/models').NormalizedPlayer[];
    skaterStats: import('../domain/models').NormalizedSkaterStats[];
    goalieStats: import('../domain/models').NormalizedGoalieStats[];
  }
): Promise<ConnectorResult> {
  run.status = status;
  run.completedAt = new Date();
  run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();

  // Update DB run record
  if (runId) {
    try {
      await updateIngestionRun(runId, {
        status: run.status,
        recordsFetched: run.recordsFetched,
        recordsInserted: run.recordsInserted,
        recordsUpdated: run.recordsUpdated,
        recordsSkipped: run.recordsSkipped,
        errors: run.errors,
        completedAt: run.completedAt,
        durationMs: run.durationMs,
      });
    } catch { /* best-effort */ }
  }

  // Update connector status
  try {
    if (status === 'success') {
      await markConnectorSuccess(connectorName);
    } else if (status === 'failed') {
      await markConnectorFailure(connectorName);
    }
  } catch { /* best-effort */ }

  log.info(`[${connectorName}] Completed: ${status} in ${run.durationMs}ms`);

  return {
    players: data?.players || [],
    skaterStats: data?.skaterStats || [],
    goalieStats: data?.goalieStats || [],
    run,
  };
}
