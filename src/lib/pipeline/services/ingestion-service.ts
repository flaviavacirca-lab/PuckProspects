// ============================================================================
// Ingestion Service
// ============================================================================
// High-level service for managing ingestion runs. This is the main entry
// point for triggering ingestion from API routes, CLI scripts, or jobs.
// ============================================================================

import { registry } from '../connectors/registry';
import { runConnector, runAll, runByName, ETLOptions } from '../core/etl';
import { getPipelineConfig, getEnabledSources } from '../config';
import { ConnectorResult } from '../domain/models';
import { createLogger } from '../core/logger';

const log = createLogger('IngestionService');

export class IngestionService {
  /**
   * Run ingestion for all enabled sources.
   */
  async ingestAll(options?: ETLOptions): Promise<ConnectorResult[]> {
    const config = getPipelineConfig();
    const sources = getEnabledSources();

    if (sources.length === 0) {
      log.warn('No enabled sources configured');
      return [];
    }

    log.info(`Starting full ingestion for ${sources.length} source(s)`);

    return runAll({
      ...options,
      concurrency: config.concurrency,
      maxRetries: options?.maxRetries ?? config.maxRetries,
      storeRawPayloads: options?.storeRawPayloads ?? config.storeRawPayloads,
    });
  }

  /**
   * Run ingestion for a specific connector by name.
   */
  async ingestSource(connectorName: string, options?: ETLOptions): Promise<ConnectorResult> {
    if (!registry.has(connectorName)) {
      throw new Error(`Connector not found: ${connectorName}. Available: ${registry.listNames().join(', ')}`);
    }

    log.info(`Starting ingestion for ${connectorName}`);
    return runByName(connectorName, options);
  }

  /**
   * Run ingestion for all sources in a specific league.
   */
  async ingestLeague(leagueCode: string, options?: ETLOptions): Promise<ConnectorResult[]> {
    const config = getPipelineConfig();

    log.info(`Starting ingestion for league: ${leagueCode}`);
    return runAll({
      ...options,
      leagues: [leagueCode],
      concurrency: config.concurrency,
    });
  }

  /**
   * Dry run — validate the pipeline without persisting.
   */
  async dryRun(connectorName: string): Promise<ConnectorResult> {
    return this.ingestSource(connectorName, { dryRun: true });
  }

  /**
   * List all registered connectors and their status.
   */
  listConnectors(): Array<{
    name: string;
    league: string;
    type: string;
    registered: boolean;
  }> {
    const registeredNames = registry.listNames();
    const sources = getEnabledSources();

    // Combine registered + configured (some may be configured but not yet implemented)
    const all = new Map<string, { name: string; league: string; type: string; registered: boolean }>();
    const registeredSet = new Set(registeredNames);

    for (const name of registeredNames) {
      const connector = registry.create(name);
      all.set(name, {
        name,
        league: connector.descriptor.league,
        type: connector.descriptor.sourceType,
        registered: true,
      });
    }

    for (const source of sources) {
      if (!all.has(source.name)) {
        all.set(source.name, {
          name: source.name,
          league: source.league,
          type: source.type,
          registered: false,
        });
      }
    }

    return Array.from(all.values());
  }
}

/** Singleton instance */
let _service: IngestionService | null = null;

export function getIngestionService(): IngestionService {
  if (!_service) {
    _service = new IngestionService();
  }
  return _service;
}
