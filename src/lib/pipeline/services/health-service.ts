// ============================================================================
// Health Service
// ============================================================================
// Monitors the health of data sources and connectors. Used by the admin
// dashboard and API routes to report ingestion status.
// ============================================================================

import pool from '@/lib/db';
import { registry } from '../connectors/registry';
import { createLogger } from '../core/logger';

const log = createLogger('HealthService');

export interface SourceHealth {
  connectorName: string;
  league: string;
  sourceType: string;
  enabled: boolean;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  consecutiveFailures: number;
  healthy: boolean;
  lastRunStatus: string | null;
  lastRunRecords: number;
  lastRunDurationMs: number | null;
  lastRunAt: string | null;
}

export interface PipelineHealth {
  totalSources: number;
  activeSources: number;
  healthySources: number;
  unhealthySources: number;
  sources: SourceHealth[];
  lastFullRunAt: string | null;
}

export class HealthService {
  /**
   * Get health status for all configured sources.
   */
  async getHealth(): Promise<PipelineHealth> {
    const sources: SourceHealth[] = [];

    try {
      // Query source_connectors table for DB-tracked status
      const connectors = await pool.query(
        `SELECT sc.*,
          (SELECT il.status FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_status,
          (SELECT il.records_fetched FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_records,
          (SELECT il.duration_ms FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_duration_ms,
          (SELECT il.started_at FROM ingestion_log il
           WHERE il.connector_name = sc.connector_name
           ORDER BY il.started_at DESC LIMIT 1) as last_run_at
         FROM source_connectors sc
         ORDER BY sc.league_code, sc.connector_name`
      );

      for (const row of connectors.rows) {
        sources.push({
          connectorName: row.connector_name,
          league: row.league_code,
          sourceType: row.source_type,
          enabled: row.enabled,
          lastSuccessAt: row.last_success_at?.toISOString() || null,
          lastFailureAt: row.last_failure_at?.toISOString() || null,
          consecutiveFailures: row.consecutive_failures || 0,
          healthy: row.consecutive_failures < 3 && row.enabled,
          lastRunStatus: row.last_run_status || null,
          lastRunRecords: row.last_run_records || 0,
          lastRunDurationMs: row.last_run_duration_ms || null,
          lastRunAt: row.last_run_at?.toISOString() || null,
        });
      }
    } catch (err) {
      // DB may not be available — fall back to registry-only info
      log.warn('Could not query source health from DB', { error: String(err) });

      for (const name of registry.listNames()) {
        const connector = registry.create(name);
        sources.push({
          connectorName: name,
          league: connector.descriptor.league,
          sourceType: connector.descriptor.sourceType,
          enabled: true,
          lastSuccessAt: null,
          lastFailureAt: null,
          consecutiveFailures: 0,
          healthy: true,
          lastRunStatus: null,
          lastRunRecords: 0,
          lastRunDurationMs: null,
          lastRunAt: null,
        });
      }
    }

    const healthy = sources.filter(s => s.healthy).length;
    const unhealthy = sources.filter(s => !s.healthy).length;

    // Find last full run
    let lastFullRunAt: string | null = null;
    try {
      const result = await pool.query(
        `SELECT MAX(started_at) as last_run FROM ingestion_log`
      );
      lastFullRunAt = result.rows[0]?.last_run?.toISOString() || null;
    } catch { /* best-effort */ }

    return {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.enabled).length,
      healthySources: healthy,
      unhealthySources: unhealthy,
      sources,
      lastFullRunAt,
    };
  }

  /**
   * Get recent ingestion runs.
   */
  async getRecentRuns(limit = 20): Promise<Array<{
    id: number;
    connectorName: string;
    league: string;
    status: string;
    recordsFetched: number;
    recordsInserted: number;
    recordsUpdated: number;
    durationMs: number | null;
    startedAt: string;
    completedAt: string | null;
  }>> {
    try {
      const result = await pool.query(
        `SELECT id, connector_name, league_code, status,
                records_fetched, records_inserted, records_updated,
                duration_ms, started_at, completed_at
         FROM ingestion_log
         ORDER BY started_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows.map(row => ({
        id: row.id,
        connectorName: row.connector_name,
        league: row.league_code,
        status: row.status,
        recordsFetched: row.records_fetched,
        recordsInserted: row.records_inserted,
        recordsUpdated: row.records_updated,
        durationMs: row.duration_ms,
        startedAt: row.started_at?.toISOString(),
        completedAt: row.completed_at?.toISOString() || null,
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
  }>> {
    const results: Array<{ connectorName: string; healthy: boolean; message: string }> = [];

    for (const name of registry.listNames()) {
      const connector = registry.create(name);
      if (connector.healthCheck) {
        try {
          const check = await connector.healthCheck();
          results.push({ connectorName: name, ...check });
        } catch (err) {
          results.push({ connectorName: name, healthy: false, message: String(err) });
        }
      }
    }

    return results;
  }
}

let _service: HealthService | null = null;

export function getHealthService(): HealthService {
  if (!_service) {
    _service = new HealthService();
  }
  return _service;
}
