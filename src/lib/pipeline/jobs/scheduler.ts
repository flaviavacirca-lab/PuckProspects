// ============================================================================
// Pipeline Scheduler
// ============================================================================
// Runs connectors on their configured cadence with failure isolation.
// Each connector runs independently — a failure in one connector does not
// affect others. Tracks run history and respects cadence intervals.
//
// Usage:
//   npx tsx src/lib/pipeline/jobs/scheduler.ts
//   npx tsx src/lib/pipeline/jobs/scheduler.ts --once    (single pass, then exit)
//   npx tsx src/lib/pipeline/jobs/scheduler.ts --dry-run (no persistence)
//
// Cadence intervals:
//   realtime → 15 minutes
//   hourly   → 1 hour
//   daily    → 6 hours
//   weekly   → 24 hours
//   manual   → never (skip in scheduler)
// ============================================================================

import { getIngestionService } from '../services/ingestion-service';
import { getEnabledSources, getPipelineConfig } from '../config';
import { SourceConfig } from '../config/sources';
import { createLogger } from '../core/logger';
import { ConnectorResult } from '../domain/models';
import '../connectors/registry';

const log = createLogger('Scheduler');

// ── Cadence → interval mapping ──

const CADENCE_MS: Record<string, number> = {
  realtime: 15 * 60 * 1000,       // 15 min
  hourly:   60 * 60 * 1000,       // 1 hour
  daily:    6 * 60 * 60 * 1000,   // 6 hours
  weekly:   24 * 60 * 60 * 1000,  // 24 hours
  manual:   0,                     // never
};

// ── Per-connector state ──

interface ConnectorState {
  source: SourceConfig;
  lastRunAt: number;          // epoch ms
  lastStatus: 'success' | 'failed' | 'pending';
  consecutiveFailures: number;
  nextRunAt: number;           // epoch ms
  running: boolean;
}

// ── Scheduler ──

export class PipelineScheduler {
  private states: Map<string, ConnectorState> = new Map();
  private running = false;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private dryRun = false;

  constructor(options?: { dryRun?: boolean }) {
    this.dryRun = options?.dryRun ?? false;
  }

  /** Initialize state for all enabled sources. */
  init(): void {
    const sources = getEnabledSources();

    for (const source of sources) {
      if (source.cadence === 'manual') continue;

      const intervalMs = CADENCE_MS[source.cadence] || CADENCE_MS.daily;

      this.states.set(source.name, {
        source,
        lastRunAt: 0,
        lastStatus: 'pending',
        consecutiveFailures: 0,
        nextRunAt: Date.now(), // Run immediately on first pass
        running: false,
      });
    }

    log.info(`Scheduler initialized with ${this.states.size} source(s)`, {
      sources: Array.from(this.states.keys()),
    });
  }

  /** Start the scheduler loop. Ticks every 30 seconds. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.init();

    log.info('Scheduler started');
    this.tick(); // Run immediately
    this.tickInterval = setInterval(() => this.tick(), 30_000);
  }

  /** Stop the scheduler. */
  stop(): void {
    this.running = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    log.info('Scheduler stopped');
  }

  /** Run a single pass: check all connectors and run any that are due. */
  async tick(): Promise<void> {
    if (!this.running && this.tickInterval) return;

    const now = Date.now();
    const config = getPipelineConfig();
    const service = getIngestionService();
    const due: ConnectorState[] = [];

    for (const state of Array.from(this.states.values())) {
      if (state.running) continue;
      if (now < state.nextRunAt) continue;
      due.push(state);
    }

    if (due.length === 0) return;

    log.info(`${due.length} connector(s) due for ingestion`, {
      connectors: due.map(d => d.source.name),
    });

    // Run in batches respecting concurrency
    const concurrency = config.concurrency;
    for (let i = 0; i < due.length; i += concurrency) {
      const batch = due.slice(i, i + concurrency);

      await Promise.allSettled(
        batch.map(state => this.runConnector(state, service))
      );
    }
  }

  /** Run a single pass (all due connectors) then return. */
  async runOnce(): Promise<ConnectorState[]> {
    this.init();
    // Force all connectors to be due now
    for (const state of Array.from(this.states.values())) {
      state.nextRunAt = 0;
    }
    await this.tick();
    return Array.from(this.states.values());
  }

  /** Get current state of all connectors. */
  getStates(): ConnectorState[] {
    return Array.from(this.states.values());
  }

  // ── Private ──

  private async runConnector(
    state: ConnectorState,
    service: ReturnType<typeof getIngestionService>
  ): Promise<void> {
    state.running = true;
    const startedAt = Date.now();

    log.info(`Running ${state.source.name}`, {
      cadence: state.source.cadence,
      consecutiveFailures: state.consecutiveFailures,
    });

    try {
      const result: ConnectorResult = this.dryRun
        ? await service.dryRun(state.source.name)
        : await service.ingestSource(state.source.name);

      state.lastRunAt = startedAt;
      state.lastStatus = result.run.status === 'success' ? 'success' : 'failed';

      if (result.run.status === 'success') {
        state.consecutiveFailures = 0;
        log.info(`${state.source.name} completed successfully`, {
          fetched: result.run.recordsFetched,
          inserted: result.run.recordsInserted,
          updated: result.run.recordsUpdated,
          durationMs: result.run.durationMs,
        });
      } else {
        state.consecutiveFailures++;
        log.warn(`${state.source.name} completed with status: ${result.run.status}`, {
          errors: result.run.errors.length,
          durationMs: result.run.durationMs,
        });
      }
    } catch (err) {
      state.lastRunAt = startedAt;
      state.lastStatus = 'failed';
      state.consecutiveFailures++;
      log.error(`${state.source.name} failed`, { error: String(err) });
    } finally {
      state.running = false;
      state.nextRunAt = this.calculateNextRun(state);
    }
  }

  private calculateNextRun(state: ConnectorState): number {
    const baseInterval = CADENCE_MS[state.source.cadence] || CADENCE_MS.daily;

    // Exponential backoff on consecutive failures: 2x, 4x, 8x (capped at 8x)
    if (state.consecutiveFailures > 0) {
      const backoffMultiplier = Math.min(
        Math.pow(2, state.consecutiveFailures),
        8
      );
      const backoffMs = baseInterval * backoffMultiplier;
      log.info(`${state.source.name} backing off: next run in ${Math.round(backoffMs / 60000)}min`, {
        consecutiveFailures: state.consecutiveFailures,
        backoffMultiplier,
      });
      return Date.now() + backoffMs;
    }

    return Date.now() + baseInterval;
  }
}

// ── CLI entry point ──

async function main() {
  const args = process.argv.slice(2);
  const once = args.includes('--once');
  const dryRun = args.includes('--dry-run');

  const scheduler = new PipelineScheduler({ dryRun });

  if (once) {
    log.info('Running single pass...');
    const states = await scheduler.runOnce();

    // Print summary
    const succeeded = states.filter(s => s.lastStatus === 'success').length;
    const failed = states.filter(s => s.lastStatus === 'failed').length;
    const pending = states.filter(s => s.lastStatus === 'pending').length;

    log.info('Single pass complete', { succeeded, failed, pending });
    process.exit(failed > 0 ? 1 : 0);
  }

  // Long-running mode
  scheduler.start();

  // Graceful shutdown
  const shutdown = () => {
    log.info('Shutting down...');
    scheduler.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  log.error('Scheduler failed to start', { error: String(err) });
  process.exit(1);
});
