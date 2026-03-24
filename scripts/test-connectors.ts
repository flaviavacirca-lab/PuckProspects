#!/usr/bin/env npx tsx
// ============================================================================
// Connector Integration Test Script
// ============================================================================
// Runs the implemented connectors through the full ETL pipeline (dry run)
// to verify that fetch → parse → normalize → validate works end to end.
//
// Usage:
//   npx tsx scripts/test-connectors.ts                   # all implemented
//   npx tsx scripts/test-connectors.ts nhl_api           # specific connector
//   npx tsx scripts/test-connectors.ts ohl shl           # multiple
//   npx tsx scripts/test-connectors.ts --quick           # short test (1 team)
//
// This runs in DRY RUN mode — no database writes.
// ============================================================================

import { registry } from '../src/lib/pipeline/connectors/registry';
import type { ConnectorResult, NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats } from '../src/lib/pipeline/domain/models';
import type { IConnector } from '../src/lib/pipeline/connectors/base';

const IMPLEMENTED_CONNECTORS = ['nhl_api', 'ohl', 'shl', 'hockeydb'];

async function testConnector(name: string): Promise<{
  name: string;
  success: boolean;
  players: number;
  skaterStats: number;
  goalieStats: number;
  validationErrors: number;
  durationMs: number;
  samplePlayer?: Partial<NormalizedPlayer>;
  sampleStat?: Partial<NormalizedSkaterStats>;
  error?: string;
}> {
  const start = Date.now();
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  Testing: ${name}`);
  console.log(`${'='.repeat(70)}`);

  try {
    const connector: IConnector = registry.create(name);
    console.log(`  Source: ${connector.descriptor.sourceUrl}`);
    console.log(`  Type: ${connector.descriptor.sourceType}`);
    console.log(`  Maturity: ${connector.descriptor.maturity}`);
    console.log(`  Tier: ${connector.descriptor.tier}`);

    // Phase 1: Fetch
    console.log(`\n  [1/4] Fetching...`);
    const fetchResults = await connector.fetch();
    console.log(`  ✓ Fetched ${fetchResults.length} result(s)`);
    for (const r of fetchResults) {
      const sizeKb = Math.round(Buffer.byteLength(r.rawBody, 'utf8') / 1024);
      console.log(`    - ${r.url} (${r.contentType}, ${sizeKb}KB, HTTP ${r.httpStatus})`);
    }

    // Phase 2: Parse
    console.log(`\n  [2/4] Parsing...`);
    const parsed = await connector.parse(fetchResults);
    console.log(`  ✓ Parsed ${parsed.length} record(s)`);
    if (parsed.length > 0) {
      const types = parsed.reduce((acc, r) => { acc[r.recordType] = (acc[r.recordType] || 0) + 1; return acc; }, {} as Record<string, number>);
      console.log(`    Types: ${Object.entries(types).map(([t, n]) => `${t}=${n}`).join(', ')}`);
    }

    // Phase 3: Normalize
    console.log(`\n  [3/4] Normalizing...`);
    const normalized = await connector.normalize(parsed);
    console.log(`  ✓ Normalized:`);
    console.log(`    - ${normalized.players.length} players`);
    console.log(`    - ${normalized.skaterStats.length} skater stats`);
    console.log(`    - ${normalized.goalieStats.length} goalie stats`);

    // Phase 4: Validate
    console.log(`\n  [4/4] Validating...`);
    const validated = await connector.validate(normalized);
    const errors = validated.validationErrors.filter(e => e.level === 'error');
    const warnings = validated.validationErrors.filter(e => e.level === 'warning');
    console.log(`  ✓ Validation: ${errors.length} errors, ${warnings.length} warnings`);

    if (errors.length > 0 && errors.length <= 5) {
      for (const e of errors) {
        console.log(`    ERROR: ${e.field} — ${e.message}`);
      }
    }

    // Sample output
    const samplePlayer = normalized.players[0];
    const sampleStat = normalized.skaterStats[0];

    if (samplePlayer) {
      console.log(`\n  Sample Player:`);
      console.log(`    Name: ${samplePlayer.fullName}`);
      console.log(`    Position: ${samplePlayer.position} (${samplePlayer.positionGroup})`);
      console.log(`    Team: ${samplePlayer.teamName}`);
      console.log(`    DOB: ${samplePlayer.dateOfBirth} (age ${samplePlayer.age})`);
      console.log(`    Height: ${samplePlayer.heightCm}cm, Weight: ${samplePlayer.weightKg}kg`);
      console.log(`    Nationality: ${samplePlayer.nationality}`);
      console.log(`    Draft: ${samplePlayer.draftStatus || 'N/A'} ${samplePlayer.draftYear || ''} Rd${samplePlayer.draftRound || ''} #${samplePlayer.draftOverall || ''}`);
      console.log(`    NHL Rights: ${samplePlayer.nhlRightsHolder || 'N/A'}`);
      console.log(`    Source IDs: ${JSON.stringify(samplePlayer.sourceIds)}`);
      console.log(`    Quality: confidence=${samplePlayer.dataQuality.confidence}, missing=[${samplePlayer.dataQuality.missingFields.join(', ')}]`);
    }

    if (sampleStat) {
      console.log(`\n  Sample Skater Stat:`);
      console.log(`    Season: ${sampleStat.season}, League: ${sampleStat.league}`);
      console.log(`    Team: ${sampleStat.teamName}`);
      console.log(`    GP: ${sampleStat.gamesPlayed}, G: ${sampleStat.goals}, A: ${sampleStat.assists}, P: ${sampleStat.points}`);
      console.log(`    PPG: ${sampleStat.pointsPerGame}, +/-: ${sampleStat.plusMinus}`);
      console.log(`    PP: ${sampleStat.ppGoals}-${sampleStat.ppAssists}, SH: ${sampleStat.shGoals}-${sampleStat.shAssists}`);
      console.log(`    Shots: ${sampleStat.shots}, Sh%: ${sampleStat.shootingPct}`);
    }

    const sampleGoalie = normalized.goalieStats[0];
    if (sampleGoalie) {
      console.log(`\n  Sample Goalie Stat:`);
      console.log(`    Season: ${sampleGoalie.season}, League: ${sampleGoalie.league}`);
      console.log(`    Team: ${sampleGoalie.teamName}`);
      console.log(`    GP: ${sampleGoalie.gamesPlayed}, W: ${sampleGoalie.wins}, L: ${sampleGoalie.losses}`);
      console.log(`    GAA: ${sampleGoalie.goalsAgainstAvg}, SV%: ${sampleGoalie.savePct}`);
      console.log(`    SO: ${sampleGoalie.shutouts}`);
    }

    const durationMs = Date.now() - start;
    console.log(`\n  Duration: ${durationMs}ms`);
    console.log(`  Status: SUCCESS`);

    return {
      name,
      success: true,
      players: normalized.players.length,
      skaterStats: normalized.skaterStats.length,
      goalieStats: normalized.goalieStats.length,
      validationErrors: errors.length,
      durationMs,
      samplePlayer: samplePlayer ? {
        fullName: samplePlayer.fullName,
        position: samplePlayer.position,
        teamName: samplePlayer.teamName,
        nationality: samplePlayer.nationality,
        age: samplePlayer.age,
      } : undefined,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    console.log(`\n  ERROR: ${message}`);
    console.log(`  Duration: ${durationMs}ms`);
    console.log(`  Status: FAILED`);

    return {
      name,
      success: false,
      players: 0,
      skaterStats: 0,
      goalieStats: 0,
      validationErrors: 0,
      durationMs,
      error: message,
    };
  }
}

async function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const connectors = args.length > 0 ? args : IMPLEMENTED_CONNECTORS;

  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║               PuckProspects Connector Integration Test              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting ${connectors.length} connector(s): ${connectors.join(', ')}`);
  console.log('Mode: DRY RUN (no database writes)');

  // Show registry status
  const allNames = registry.listNames();
  console.log(`\nRegistry: ${allNames.length} total connectors registered`);

  const results = [];
  for (const name of connectors) {
    if (!registry.has(name)) {
      console.log(`\n  SKIP: '${name}' not found in registry`);
      continue;
    }
    results.push(await testConnector(name));
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('  SUMMARY');
  console.log(`${'='.repeat(70)}`);
  console.log(`  ${'Connector'.padEnd(15)} ${'Status'.padEnd(10)} ${'Players'.padEnd(10)} ${'Skaters'.padEnd(10)} ${'Goalies'.padEnd(10)} ${'Time'.padEnd(10)}`);
  console.log(`  ${'-'.repeat(65)}`);

  for (const r of results) {
    const status = r.success ? 'OK' : 'FAIL';
    console.log(`  ${r.name.padEnd(15)} ${status.padEnd(10)} ${String(r.players).padEnd(10)} ${String(r.skaterStats).padEnd(10)} ${String(r.goalieStats).padEnd(10)} ${(r.durationMs + 'ms').padEnd(10)}`);
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`\n  Total: ${succeeded} passed, ${failed} failed out of ${results.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
