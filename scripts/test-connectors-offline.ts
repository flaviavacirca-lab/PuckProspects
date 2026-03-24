#!/usr/bin/env npx tsx
// ============================================================================
// Offline Connector Test — Validates Parse + Normalize + Validate
// ============================================================================
// Uses sample fixture data to prove the full pipeline works without network.
// Tests all 4 implemented connectors with realistic fixture data.
//
// Usage: npx tsx scripts/test-connectors-offline.ts
// ============================================================================

import { registry } from '../src/lib/pipeline/connectors/registry';
import type { FetchResult } from '../src/lib/pipeline/connectors/base';

// ── NHL API Fixture (one team's prospect data) ──
const NHL_API_FIXTURE: string = JSON.stringify({
  forwards: [
    {
      id: 8482671,
      firstName: { default: 'Matthew' },
      lastName: { default: 'Knies' },
      positionCode: 'L',
      shootsCatches: 'L',
      heightInInches: 75,
      weightInPounds: 217,
      birthDate: '2002-10-17',
      birthCity: { default: 'Phoenix' },
      birthCountry: 'USA',
      birthStateProvince: { default: 'AZ' },
      currentTeamAbbrev: 'TOR',
      currentTeamName: { default: 'Toronto Maple Leafs' },
      leagueAbbrev: 'NHL',
      draftYear: 2021,
      draftRound: 2,
      draftPickInRound: 27,
      draftOverallPick: 57,
    },
    {
      id: 8483500,
      firstName: { default: 'Fraser' },
      lastName: { default: 'Minten' },
      positionCode: 'C',
      shootsCatches: 'L',
      heightInInches: 73,
      weightInPounds: 185,
      birthDate: '2004-05-23',
      birthCity: { default: 'Edmonton' },
      birthCountry: 'CAN',
      currentTeamName: { default: 'Toronto Marlies' },
      leagueAbbrev: 'AHL',
      draftYear: 2022,
      draftRound: 2,
      draftPickInRound: 6,
      draftOverallPick: 38,
    },
  ],
  defensemen: [
    {
      id: 8484144,
      firstName: { default: 'Topi' },
      lastName: { default: 'Niemela' },
      positionCode: 'D',
      shootsCatches: 'R',
      heightInInches: 71,
      weightInPounds: 170,
      birthDate: '2002-03-23',
      birthCity: { default: 'Espoo' },
      birthCountry: 'FIN',
      currentTeamName: { default: 'Toronto Marlies' },
      leagueAbbrev: 'AHL',
      draftYear: 2020,
      draftRound: 3,
      draftPickInRound: 32,
      draftOverallPick: 64,
    },
  ],
  goalies: [
    {
      id: 8483533,
      firstName: { default: 'Dennis' },
      lastName: { default: 'Hildeby' },
      positionCode: 'G',
      shootsCatches: 'L',
      heightInInches: 77,
      weightInPounds: 220,
      birthDate: '2002-05-26',
      birthCity: { default: 'Stockholm' },
      birthCountry: 'SWE',
      currentTeamName: { default: 'Toronto Marlies' },
      leagueAbbrev: 'AHL',
      draftYear: 2022,
      draftRound: 4,
      draftPickInRound: 10,
      draftOverallPick: 122,
    },
  ],
});

// ── OHL HockeyTech Fixture (JSONP wrapped) ──
const OHL_SKATER_FIXTURE: string = `{"SiteKit":{"Statviewtype":[
  {"player_id":"24891","first_name":"Michael","last_name":"Misa","name":"Misa, Michael","position":"C","birthdate":"2007-01-07","height":"5-11","weight":"175","shoots":"L","team_name":"Saginaw Spirit","games_played":"50","goals":"35","assists":"45","points":"80","penalty_minutes":"22","plus_minus":"25","power_play_goals":"12","power_play_assists":"15","short_handed_goals":"1","short_handed_assists":"0","shots":"220","shooting_percentage":"15.9","game_winning_goals":"6","nationality":"CAN"},
  {"player_id":"25102","first_name":"Luca","last_name":"Pinelli","name":"Pinelli, Luca","position":"C","birthdate":"2005-08-12","height":"5-10","weight":"170","shoots":"L","team_name":"Ottawa 67s","games_played":"52","goals":"28","assists":"40","points":"68","penalty_minutes":"14","plus_minus":"18","power_play_goals":"8","power_play_assists":"10","short_handed_goals":"0","short_handed_assists":"2","shots":"180","shooting_percentage":"15.6","game_winning_goals":"4","nationality":"CAN"},
  {"player_id":"25200","first_name":"Beckett","last_name":"Sennecke","name":"Sennecke, Beckett","position":"RW","birthdate":"2006-01-20","height":"6-3","weight":"195","shoots":"R","team_name":"Oshawa Generals","games_played":"48","goals":"30","assists":"35","points":"65","penalty_minutes":"30","plus_minus":"12","power_play_goals":"10","power_play_assists":"8","short_handed_goals":"2","short_handed_assists":"1","shots":"200","shooting_percentage":"15.0","game_winning_goals":"5","nationality":"CAN"}
]}}`;

const OHL_GOALIE_FIXTURE: string = `{"SiteKit":{"Statviewtype":[
  {"player_id":"25050","first_name":"Jack","last_name":"Ivankovic","name":"Ivankovic, Jack","position":"G","birthdate":"2005-03-15","height":"6-4","weight":"195","shoots":"L","team_name":"Brampton Steelheads","games_played":"45","wins":"32","losses":"10","ot_losses":"3","shutouts":"5","saves":"1200","goals_against":"95","goals_against_average":"2.15","save_percentage":"0.927","shots_against":"1295","minutes_played":"2650","games_started":"43","nationality":"CAN"}
]}}`;

// ── SHL Fixture (JSON API response) ──
const SHL_PLAYERS_FIXTURE: string = JSON.stringify([
  {
    player: { id: 5001, first_name: 'William', last_name: 'Eklund', nationality: 'SWE', position: 'LW', date_of_birth: '2002-10-12', height: 180, weight: 80, shoots: 'L' },
    team: { code: 'DIF', name: 'Djurgardens IF' },
    games_played: 42, goals: 15, assists: 28, points: 43, penalty_minutes: 12, plus_minus: 18,
  },
  {
    player: { id: 5002, first_name: 'Elias', last_name: 'Pettersson', nationality: 'SWE', position: 'C', date_of_birth: '1998-11-12', height: 188, weight: 80, shoots: 'L' },
    team: { code: 'TIM', name: 'Timra IK' },
    games_played: 38, goals: 12, assists: 22, points: 34, penalty_minutes: 8, plus_minus: 10,
  },
]);

const SHL_GOALIES_FIXTURE: string = JSON.stringify([
  {
    player: { id: 5050, first_name: 'Jesper', last_name: 'Wallstedt', nationality: 'SWE', position: 'G', date_of_birth: '2002-11-14', height: 190, weight: 88 },
    team: { code: 'LUL', name: 'Lulea HF' },
    games_played: 35, wins: 22, losses: 8, overtime_losses: 5, shutouts: 4, goals_against: 70, goals_against_average: 2.05, saves: 950, saves_percent: 0.931,
  },
]);

// ── HockeyDB Draft Page Fixture ──
const HOCKEYDB_FIXTURE: string = `
<html><body>
<h1>2024 NHL Entry Draft</h1>
<table>
<tr><th>Rd</th><th>#</th><th>Player</th><th>Pos</th><th>Team</th><th>League</th></tr>
<tr><td>1</td><td>1</td><td><a href="/ihdb/stats/pdisplay.php?pid=250001">Macklin Celebrini</a></td><td>C</td><td>San Jose Sharks</td><td>NCAA</td></tr>
<tr><td>1</td><td>2</td><td><a href="/ihdb/stats/pdisplay.php?pid=250002">Artyom Levshunov</a></td><td>D</td><td>Chicago Blackhawks</td><td>NCAA</td></tr>
<tr><td>1</td><td>3</td><td><a href="/ihdb/stats/pdisplay.php?pid=250003">Beckett Sennecke</a></td><td>RW</td><td>Anaheim Ducks</td><td>OHL</td></tr>
<tr><td>1</td><td>4</td><td><a href="/ihdb/stats/pdisplay.php?pid=250004">Cayden Lindstrom</a></td><td>C</td><td>Columbus Blue Jackets</td><td>WHL</td></tr>
<tr><td>1</td><td>5</td><td><a href="/ihdb/stats/pdisplay.php?pid=250005">Ivan Demidov</a></td><td>RW</td><td>Montreal Canadiens</td><td>KHL</td></tr>
</table>
</body></html>`;

// ── Test runner ──

async function testWithFixture(
  name: string,
  fixtures: Array<{ rawBody: string; contentType: 'json' | 'html'; url: string }>
) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  Testing: ${name} (offline with fixtures)`);
  console.log(`${'='.repeat(70)}`);

  const connector = registry.create(name);
  console.log(`  Maturity: ${connector.descriptor.maturity}`);
  console.log(`  Type: ${connector.descriptor.sourceType}`);

  const fetchResults: FetchResult[] = fixtures.map(f => ({
    rawBody: f.rawBody,
    contentType: f.contentType,
    httpStatus: 200,
    url: f.url,
    fetchedAt: new Date(),
  }));
  console.log(`\n  [1/4] Fetch: ${fetchResults.length} fixture(s) loaded`);

  // Parse
  const parsed = await connector.parse(fetchResults);
  console.log(`  [2/4] Parse: ${parsed.length} record(s)`);
  const types = parsed.reduce((acc, r) => { acc[r.recordType] = (acc[r.recordType] || 0) + 1; return acc; }, {} as Record<string, number>);
  console.log(`    Types: ${Object.entries(types).map(([t, n]) => `${t}=${n}`).join(', ')}`);

  // Normalize
  const normalized = await connector.normalize(parsed);
  console.log(`  [3/4] Normalize: ${normalized.players.length} players, ${normalized.skaterStats.length} skater stats, ${normalized.goalieStats.length} goalie stats`);

  // Validate
  const validated = await connector.validate(normalized);
  const errors = validated.validationErrors.filter(e => e.level === 'error');
  const warnings = validated.validationErrors.filter(e => e.level === 'warning');
  console.log(`  [4/4] Validate: ${errors.length} errors, ${warnings.length} warnings`);

  if (errors.length > 0) {
    for (const e of errors.slice(0, 3)) {
      console.log(`    ERROR: ${e.field} — ${e.message}`);
    }
  }

  // Print all players
  for (const p of normalized.players.slice(0, 3)) {
    console.log(`\n  Player: ${p.fullName}`);
    console.log(`    Position: ${p.position} (${p.positionGroup}), Team: ${p.teamName}`);
    console.log(`    DOB: ${p.dateOfBirth}, Age: ${p.age}, Nat: ${p.nationality}`);
    console.log(`    Height: ${p.heightCm}cm, Weight: ${p.weightKg}kg, Hand: ${p.handedness}`);
    console.log(`    Draft: ${p.draftStatus || 'N/A'} ${p.draftYear || ''} Rd${p.draftRound || '-'} #${p.draftOverall || '-'} by ${p.draftedBy || 'N/A'}`);
    console.log(`    NHL Rights: ${p.nhlRightsHolder || 'N/A'}`);
    console.log(`    Source IDs: ${JSON.stringify(p.sourceIds)}`);
    console.log(`    Quality: conf=${p.dataQuality.confidence.toFixed(2)}, missing=[${p.dataQuality.missingFields.join(', ')}]`);
  }

  // Print sample stats
  for (const s of normalized.skaterStats.slice(0, 2)) {
    console.log(`\n  Skater Stat: ${s.teamName} (${s.season} ${s.league})`);
    console.log(`    GP:${s.gamesPlayed} G:${s.goals} A:${s.assists} P:${s.points} PPG:${s.pointsPerGame} +/-:${s.plusMinus}`);
    console.log(`    PP:${s.ppGoals}-${s.ppAssists} SH:${s.shGoals}-${s.shAssists} Sh:${s.shots} Sh%:${s.shootingPct} GW:${s.gwGoals}`);
  }

  for (const g of normalized.goalieStats.slice(0, 1)) {
    console.log(`\n  Goalie Stat: ${g.teamName} (${g.season} ${g.league})`);
    console.log(`    GP:${g.gamesPlayed} W:${g.wins} L:${g.losses} OTL:${g.otl} SO:${g.shutouts}`);
    console.log(`    GAA:${g.goalsAgainstAvg} SV%:${g.savePct} SA:${g.shotsAgainst} SV:${g.saves}`);
  }

  console.log(`\n  Status: ${errors.length === 0 ? 'PASS' : 'FAIL (validation errors)'}`);

  return {
    name,
    players: normalized.players.length,
    skaterStats: normalized.skaterStats.length,
    goalieStats: normalized.goalieStats.length,
    errors: errors.length,
  };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          PuckProspects Connector Test (Offline / Fixtures)          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nRegistry: ${registry.listNames().length} total connectors`);

  const results = [];

  // 1. NHL API
  results.push(await testWithFixture('nhl_api', [
    { rawBody: NHL_API_FIXTURE, contentType: 'json', url: 'https://api-web.nhle.com/v1/prospects/TOR' },
  ]));

  // 2. OHL (HockeyTech)
  results.push(await testWithFixture('ohl', [
    { rawBody: OHL_SKATER_FIXTURE, contentType: 'json', url: 'https://lscluster.hockeytech.com/feed/?view=players&league=ohl' },
    { rawBody: OHL_GOALIE_FIXTURE, contentType: 'json', url: 'https://lscluster.hockeytech.com/feed/?view=goalies&league=ohl' },
  ]));

  // 3. SHL
  results.push(await testWithFixture('shl', [
    { rawBody: SHL_PLAYERS_FIXTURE, contentType: 'json', url: 'https://openapi.shl.se/seasons/2025/statistics/players?sort=points' },
    { rawBody: SHL_GOALIES_FIXTURE, contentType: 'json', url: 'https://openapi.shl.se/seasons/2025/statistics/goalkeepers?sort=saves_percent' },
  ]));

  // 4. HockeyDB
  results.push(await testWithFixture('hockeydb', [
    { rawBody: HOCKEYDB_FIXTURE, contentType: 'html', url: 'https://www.hockeydb.com/ihdb/draft/nhl2024e.html' },
  ]));

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('  SUMMARY');
  console.log(`${'='.repeat(70)}`);
  console.log(`  ${'Connector'.padEnd(15)} ${'Players'.padEnd(10)} ${'Skaters'.padEnd(10)} ${'Goalies'.padEnd(10)} ${'Errors'.padEnd(10)}`);
  console.log(`  ${'-'.repeat(55)}`);

  for (const r of results) {
    console.log(`  ${r.name.padEnd(15)} ${String(r.players).padEnd(10)} ${String(r.skaterStats).padEnd(10)} ${String(r.goalieStats).padEnd(10)} ${String(r.errors).padEnd(10)}`);
  }

  const totalPlayers = results.reduce((s, r) => s + r.players, 0);
  const totalStats = results.reduce((s, r) => s + r.skaterStats + r.goalieStats, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);

  console.log(`\n  Total: ${totalPlayers} players, ${totalStats} stats, ${totalErrors} validation errors`);
  console.log(`  All ${results.length} connectors: ${totalErrors === 0 ? 'PASSED' : 'ISSUES FOUND'}`);

  if (totalErrors > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
