// ============================================================================
// Ingest All Job
// ============================================================================
// Standalone script to run the full ingestion pipeline.
// Can be called from a cron job, CI, or manually via:
//   npx tsx src/lib/pipeline/jobs/ingest-all.ts
//   npx tsx src/lib/pipeline/jobs/ingest-all.ts --league ohl
//   npx tsx src/lib/pipeline/jobs/ingest-all.ts --source ep_ohl --dry-run
// ============================================================================

import { getIngestionService } from '../services/ingestion-service';
import { createLogger } from '../core/logger';

// Import the registry to trigger auto-registration of connectors
import '../connectors/registry';

const log = createLogger('IngestJob');

async function main() {
  const args = process.argv.slice(2);
  const service = getIngestionService();

  const dryRun = args.includes('--dry-run');
  const leagueIdx = args.indexOf('--league');
  const sourceIdx = args.indexOf('--source');

  log.info('=== PuckProspects Ingestion Job ===');
  log.info(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  try {
    if (sourceIdx !== -1 && args[sourceIdx + 1]) {
      // Single source
      const sourceName = args[sourceIdx + 1];
      log.info(`Running single source: ${sourceName}`);

      if (dryRun) {
        const result = await service.dryRun(sourceName);
        log.info(`Dry run complete`, {
          status: result.run.status,
          players: result.players.length,
          stats: result.skaterStats.length,
        });
      } else {
        const result = await service.ingestSource(sourceName);
        logResult(result);
      }
    } else if (leagueIdx !== -1 && args[leagueIdx + 1]) {
      // Single league
      const league = args[leagueIdx + 1];
      log.info(`Running all sources for league: ${league}`);
      const results = await service.ingestLeague(league, { dryRun });
      results.forEach(logResult);
    } else {
      // All sources
      log.info('Running all enabled sources');
      const results = await service.ingestAll({ dryRun });
      results.forEach(logResult);
    }

    log.info('=== Ingestion Job Complete ===');
    process.exit(0);
  } catch (err) {
    log.error('Ingestion job failed', { error: String(err) });
    process.exit(1);
  }
}

function logResult(result: import('../domain/models').ConnectorResult) {
  const { run } = result;
  log.info(`[${run.connectorName}] ${run.status}`, {
    fetched: run.recordsFetched,
    inserted: run.recordsInserted,
    updated: run.recordsUpdated,
    skipped: run.recordsSkipped,
    errors: run.errors.length,
    durationMs: run.durationMs,
  });
}

main();
