// ============================================================================
// Pipeline Status CLI
// ============================================================================
// Prints a health report for all configured sources.
//
// Usage:
//   npx tsx src/lib/pipeline/jobs/status.ts
//   npx tsx src/lib/pipeline/jobs/status.ts --json
//   npx tsx src/lib/pipeline/jobs/status.ts --runs
//   npx tsx src/lib/pipeline/jobs/status.ts --flagged
// ============================================================================

import { getHealthService } from '../services/health-service';
import { getSourcesSummary, getEnabledSources } from '../config';
import { createLogger } from '../core/logger';
import '../connectors/registry';

const log = createLogger('StatusCLI');

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const showRuns = args.includes('--runs');
  const showFlagged = args.includes('--flagged');

  const service = getHealthService();

  if (showRuns) {
    const runs = await service.getRecentRuns(30);
    if (jsonOutput) {
      console.log(JSON.stringify({ runs }, null, 2));
    } else {
      console.log('\nRecent Ingestion Runs:');
      console.log('─'.repeat(90));
      console.log(
        'Connector'.padEnd(22) +
        'Status'.padEnd(10) +
        'Fetched'.padStart(9) +
        'Inserted'.padStart(10) +
        'Updated'.padStart(9) +
        'Duration'.padStart(10) +
        '  Started'
      );
      console.log('─'.repeat(90));
      for (const run of runs) {
        const duration = run.durationMs ? `${run.durationMs}ms` : '-';
        const started = new Date(run.startedAt).toLocaleString();
        console.log(
          run.connectorName.padEnd(22) +
          run.status.padEnd(10) +
          String(run.recordsFetched).padStart(9) +
          String(run.recordsInserted).padStart(10) +
          String(run.recordsUpdated).padStart(9) +
          duration.padStart(10) +
          '  ' + started
        );
      }
    }
    process.exit(0);
  }

  if (showFlagged) {
    const flagged = await service.getFlaggedMatches(50);
    if (jsonOutput) {
      console.log(JSON.stringify({ flagged }, null, 2));
    } else {
      console.log(`\nFlagged Identity Matches (${flagged.length} pending):`);
      console.log('─'.repeat(80));
      for (const f of flagged) {
        const confidence = (f.bestConfidence * 100).toFixed(0) + '%';
        console.log(
          `  ${f.sourceFullName.padEnd(25)} ${f.sourceLeague.padEnd(6)} ${f.reason.padEnd(22)} ${confidence.padStart(5)}  ${f.resolution}`
        );
      }
      if (flagged.length === 0) {
        console.log('  No flagged matches.');
      }
    }
    process.exit(0);
  }

  // Default: full health report
  if (jsonOutput) {
    const health = await service.getHealth();
    console.log(JSON.stringify(health, null, 2));
  } else {
    // Use the text report generator (includes ANSI colors)
    try {
      const report = await service.generateReport();
      console.log(report);
    } catch {
      // Fall back to static info if DB is unavailable
      const summary = getSourcesSummary();
      const enabled = getEnabledSources();

      console.log('\n═══════════════════════════════════════════════════════');
      console.log(' PuckProspects Pipeline — Source Summary (no DB)');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Total sources: ${summary.total}`);
      console.log(`  Enabled:       ${summary.enabled}`);
      console.log(`  By tier:       T1=${summary.byTier[1] || 0}, T2=${summary.byTier[2] || 0}, T3=${summary.byTier[3] || 0}`);
      console.log(`  By maturity:   impl=${summary.byMaturity.implemented || 0}, partial=${summary.byMaturity.partial || 0}, scaffold=${summary.byMaturity.scaffolded || 0}`);
      console.log('\n  Enabled sources:');
      for (const src of enabled) {
        console.log(`    ${src.name.padEnd(20)} ${src.maturity.padEnd(14)} ${src.cadence.padEnd(8)} T${src.tier}`);
      }
      console.log('═══════════════════════════════════════════════════════');
    }
  }

  process.exit(0);
}

main().catch(err => {
  log.error('Status command failed', { error: String(err) });
  process.exit(1);
});
