// ============================================================================
// Health Service
// ============================================================================
// Monitors the health of data sources and connectors. Used by the admin
// dashboard, API routes, and CLI to report ingestion status.
// ============================================================================

import pool from '@/lib/db';
import { registry } from '../connectors/registry';
import { getEnabledSources, getSourcesSummary, SOURCES } from '../config';
import { createLogger } from '../core/logger';

const log = createLogger('HealthService');

// ── Types ──

export interface SourceHealth {
  connectorName: string;
  label: string;
  league: string;
  sourceType: string;
  maturity: string;
  tier: number;
  cadence: string;
  enabled: boolean;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  consecutiveFailures: number;
  healthy: boolean;
  lastRunStatus: string | null;
  lastRunRecordsFetched: number;
  lastRunRecordsInserted: number;
  lastRunRecordsUpdated: number;
  lastRunRecordsSkipped: number;
  lastRunErrors: number;
  lastRunDurationMs: number | null;
  lastRunAt: string | null;
}

export interface PipelineHealth {
  totalSources: number;
  activeSources: number;
  healthySources: number;
  unhealthySources: number;
  implementedSources: number;
  sources: SourceHealth[];
  lastFullRunAt: string | null;
  totalIngestionRuns: number;
  recentErrorRate: number;
  flaggedMatchCount: number;
}

export interface IngestionRunSummary {
  id: number;
  connectorName: string;
  league: string;
  status: string;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
  errors: string[];
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface FlaggedMatchSummary {
  id: number;
  sourceName: string;
  sourceFullName: string;
  sourceLeague: string;
  reason: string;
  bestConfidence: number;
  candidateCount: number;
  resolution: string;
  flaggedAt: string;
  resolvedAt: string | null;
}

// ── Service ──

export class HealthService {
  /**
   * Get health status for all configured sources.
   */
  async getHealth(): Promise<PipelineHealth> {
    const sources: SourceHealth[] = [];
    let totalIngestionRuns = 0;
    let recentErrorRate = 0;
    let flaggedMatchCount = 0;
    let lastFullRunAt: string | null = null;

    // Try DB-backed health data
    const dbAvailable = await this.tryDbHealth(sources);

    if (!dbAvailable) {
      // Fall back to registry + config for static info
      this.buildStaticHealth(sources);
    }

    // Get aggregate stats from DB
    try {
      const [runCountRes, errorRateRes, flaggedRes, lastRunRes] = await Promise.all([
        pool.query('SELECT COUNT(*) as cnt FROM ingestion_log'),
        pool.query(
          `SELECT COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / NULLIF(COUNT(*), 0) as rate
           FROM ingestion_log WHERE started_at > NOW() - INTERVAL '7 days'`
        ),
        pool.query(
          `SELECT COUNT(*) as cnt FROM flagged_identity_matches WHERE resolution = 'pending'`
        ),
        pool.query('SELECT MAX(started_at) as last_run FROM ingestion_log'),
      ]);
      totalIngestionRuns = parseInt(runCountRes.rows[0]?.cnt || '0', 10);
      recentErrorRate = Math.round(parseFloat(errorRateRes.rows[0]?.rate || '0') * 10) / 10;
      flaggedMatchCount = parseInt(flaggedRes.rows[0]?.cnt || '0', 10);
      lastFullRunAt = lastRunRes.rows[0]?.last_run?.toISOString() || null;
    } catch {
      // DB not available — continue with zeros
    }

    const healthy = sources.filter(s => s.healthy).length;
    const unhealthy = sources.filter(s => !s.healthy && s.enabled).length;
    const implemented = sources.filter(s => s.maturity === 'implemented').length;

    return {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.enabled).length,
      healthySources: healthy,
      unhealthySources: unhealthy,
      implementedSources: implemented,
      sources,
      lastFullRunAt,
      totalIngestionRuns,
      recentErrorRate,
      flaggedMatchCount,
    };
  }

  /**
   * Get recent ingestion runs with full detail.
   */
  async getRecentRuns(limit = 20, connectorName?: string): Promise<IngestionRunSummary[]> {
    try {
      const whereClause = connectorName
        ? 'WHERE connector_name = $2'
        : '';
      const params: (number | string)[] = [limit];
      if (connectorName) params.push(connectorName);

      const result = await pool.query(
        `SELECT id, connector_name, league_code, status,
                records_fetched, records_inserted, records_updated,
                records_skipped, errors, warnings,
                duration_ms, started_at, completed_at
         FROM ingestion_log
         ${whereClause}
         ORDER BY started_at DESC
         LIMIT $1`,
        params
      );

      return result.rows.map(row => {
        const errors = typeof row.errors === 'string'
          ? JSON.parse(row.errors)
          : (row.errors || []);
        return {
          id: row.id,
          connectorName: row.connector_name,
          league: row.league_code,
          status: row.status,
          recordsFetched: row.records_fetched || 0,
          recordsInserted: row.records_inserted || 0,
          recordsUpdated: row.records_updated || 0,
          recordsSkipped: row.records_skipped || 0,
          errorCount: Array.isArray(errors) ? errors.length : 0,
          errors: Array.isArray(errors) ? errors.map((e: { message?: string }) => e.message || String(e)) : [],
          durationMs: row.duration_ms,
          startedAt: row.started_at?.toISOString(),
          completedAt: row.completed_at?.toISOString() || null,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Get pending flagged identity matches.
   */
  async getFlaggedMatches(limit = 50): Promise<FlaggedMatchSummary[]> {
    try {
      const result = await pool.query(
        `SELECT id, source_name, source_full_name, source_league,
                reason, best_confidence, candidates, resolution,
                flagged_at, resolved_at
         FROM flagged_identity_matches
         ORDER BY flagged_at DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows.map(row => ({
        id: row.id,
        sourceName: row.source_name,
        sourceFullName: row.source_full_name,
        sourceLeague: row.source_league,
        reason: row.reason,
        bestConfidence: parseFloat(row.best_confidence) || 0,
        candidateCount: Array.isArray(row.candidates) ? row.candidates.length : 0,
        resolution: row.resolution,
        flaggedAt: row.flagged_at?.toISOString(),
        resolvedAt: row.resolved_at?.toISOString() || null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Run health checks for all registered connectors that support it.
   */
  async runHealthChecks(): Promise<Array<{
    connectorName: string;
    healthy: boolean;
    message: string;
    durationMs: number;
  }>> {
    const results: Array<{ connectorName: string; healthy: boolean; message: string; durationMs: number }> = [];

    for (const name of registry.listNames()) {
      const connector = registry.create(name);
      if (connector.healthCheck) {
        const start = Date.now();
        try {
          const check = await connector.healthCheck();
          results.push({ connectorName: name, ...check, durationMs: Date.now() - start });
        } catch (err) {
          results.push({
            connectorName: name,
            healthy: false,
            message: String(err),
            durationMs: Date.now() - start,
          });
        }
      }
    }

    return results;
  }

  /**
   * Generate a text report suitable for CLI display or logging.
   */
  async generateReport(): Promise<string> {
    const health = await this.getHealth();
    const runs = await this.getRecentRuns(10);
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push(' PuckProspects Pipeline — Health Report');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`  Total Sources:      ${health.totalSources}`);
    lines.push(`  Active/Enabled:     ${health.activeSources}`);
    lines.push(`  Implemented:        ${health.implementedSources}`);
    lines.push(`  Healthy:            ${health.healthySources}`);
    lines.push(`  Unhealthy:          ${health.unhealthySources}`);
    lines.push(`  Total Runs:         ${health.totalIngestionRuns}`);
    lines.push(`  7-Day Error Rate:   ${health.recentErrorRate}%`);
    lines.push(`  Flagged Matches:    ${health.flaggedMatchCount}`);
    lines.push(`  Last Run:           ${health.lastFullRunAt || 'Never'}`);
    lines.push('');

    // Per-source status
    lines.push('  Source Health:');
    lines.push('  ─────────────────────────────────────────────────────────────');

    const maxName = Math.max(...health.sources.map(s => s.connectorName.length), 15);

    for (const src of health.sources) {
      const status = src.healthy ? 'OK' : 'FAIL';
      const icon = src.healthy ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
      const maturity = src.maturity.padEnd(12);
      const name = src.connectorName.padEnd(maxName);
      const lastRun = src.lastRunAt
        ? new Date(src.lastRunAt).toLocaleDateString() + ' ' + new Date(src.lastRunAt).toLocaleTimeString()
        : 'Never';
      const records = src.lastRunRecordsFetched > 0 ? `${src.lastRunRecordsFetched} rec` : '-';
      lines.push(`    ${icon} ${name}  ${maturity}  ${records.padStart(7)}  ${lastRun}`);
    }

    lines.push('');

    // Recent runs
    if (runs.length > 0) {
      lines.push('  Recent Runs:');
      lines.push('  ─────────────────────────────────────────────────────────────');
      for (const run of runs) {
        const statusIcon = run.status === 'success' ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
        const name = run.connectorName.padEnd(maxName);
        const duration = run.durationMs ? `${run.durationMs}ms` : '-';
        lines.push(`    ${statusIcon} ${name}  ${run.status.padEnd(8)}  ${String(run.recordsFetched).padStart(4)} fetched  ${duration.padStart(8)}`);
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  // ── Private helpers ──

  private async tryDbHealth(sources: SourceHealth[]): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT sc.*,
          (SELECT il.status FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_status,
          (SELECT il.records_fetched FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_records_fetched,
          (SELECT il.records_inserted FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_records_inserted,
          (SELECT il.records_updated FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_records_updated,
          (SELECT il.records_skipped FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_records_skipped,
          (SELECT array_length(
            COALESCE(
              (SELECT il.errors FROM ingestion_log il
               WHERE il.connector_name = sc.connector_name
               ORDER BY il.started_at DESC LIMIT 1)::jsonb,
              '[]'::jsonb
            ), 1
          )) as last_run_errors,
          (SELECT il.duration_ms FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_duration_ms,
          (SELECT il.started_at FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_at
         FROM source_connectors sc
         ORDER BY sc.league_code, sc.connector_name`
      );

      // Merge DB data with config data
      const dbMap = new Map(result.rows.map(r => [r.connector_name, r]));

      for (const src of SOURCES) {
        const dbRow = dbMap.get(src.name);
        sources.push(this.mergeSourceHealth(src, dbRow));
      }

      return true;
    } catch (err) {
      log.warn('Could not query source health from DB', { error: String(err) });
      return false;
    }
  }

  private buildStaticHealth(sources: SourceHealth[]): void {
    for (const src of SOURCES) {
      sources.push(this.mergeSourceHealth(src, null));
    }
  }

  private mergeSourceHealth(
    src: import('../config/sources').SourceConfig,
    dbRow: Record<string, unknown> | null
  ): SourceHealth {
    return {
      connectorName: src.name,
      label: src.label,
      league: src.league,
      sourceType: src.type,
      maturity: src.maturity,
      tier: src.tier,
      cadence: src.cadence,
      enabled: src.enabled,
      lastSuccessAt: (dbRow?.last_success_at as Date)?.toISOString() || null,
      lastFailureAt: (dbRow?.last_failure_at as Date)?.toISOString() || null,
      consecutiveFailures: (dbRow?.consecutive_failures as number) || 0,
      healthy: ((dbRow?.consecutive_failures as number) || 0) < 3 && src.enabled,
      lastRunStatus: (dbRow?.last_run_status as string) || null,
      lastRunRecordsFetched: (dbRow?.last_run_records_fetched as number) || 0,
      lastRunRecordsInserted: (dbRow?.last_run_records_inserted as number) || 0,
      lastRunRecordsUpdated: (dbRow?.last_run_records_updated as number) || 0,
      lastRunRecordsSkipped: (dbRow?.last_run_records_skipped as number) || 0,
      lastRunErrors: (dbRow?.last_run_errors as number) || 0,
      lastRunDurationMs: (dbRow?.last_run_duration_ms as number) || null,
      lastRunAt: (dbRow?.last_run_at as Date)?.toISOString() || null,
    };
  }
}

let _service: HealthService | null = null;

export function getHealthService(): HealthService {
  if (!_service) {
    _service = new HealthService();
  }
  return _service;
}
