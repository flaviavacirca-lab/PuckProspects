// ============================================================================
// Identity Resolution Examples
// ============================================================================
// Demonstrates how the identity resolver handles real-world scenarios:
//   1. Exact match (same player from two sources)
//   2. Fuzzy name match (different transliteration + DOB)
//   3. Ambiguous match (same name, no DOB to disambiguate)
//   4. Cross-league match (player moved leagues)
//   5. No match (genuinely new player)
//   6. DOB mismatch (same name but different person)
//
// Run with: npx tsx src/lib/pipeline/identity/examples.ts
// ============================================================================

import { PlayerIdentityResolver, InMemoryIdentityStore, CanonicalPlayer } from './index';
import { NormalizedPlayer, DataQualityFlags } from '../domain/models';

// ── Helper to create test players ──

const defaultQuality: DataQualityFlags = {
  confidence: 1.0,
  missingFields: [],
  conflictingFields: [],
  passedValidation: true,
  validationMessages: [],
  isPartial: false,
};

function makePlayer(overrides: Partial<NormalizedPlayer> & { fullName: string; league: string; sourceName: string }): NormalizedPlayer {
  const name = overrides.fullName;
  const parts = name.split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  const defaults: NormalizedPlayer = {
    internalId: null,
    sourceIds: {},
    sourceUrl: null,
    firstName,
    lastName,
    fullName: name,
    normalizedName: (name)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z\s-]/g, '').replace(/\s+/g, ' ').trim(),
    alternateNames: [],
    dateOfBirth: null,
    age: null,
    nationality: null,
    birthCity: null,
    birthCountry: null,
    position: null,
    positionGroup: null,
    handedness: null,
    heightCm: null,
    weightKg: null,
    teamName: null,
    league: overrides.league,
    country: null,
    draftStatus: null,
    draftYear: null,
    draftRound: null,
    draftPick: null,
    draftOverall: null,
    draftedBy: null,
    nhlRightsHolder: null,
    lastUpdated: new Date(),
    snapshotDate: '2025-01-01',
    dataQuality: defaultQuality,
    customFields: {},
    sourceName: overrides.sourceName,
  };
  return { ...defaults, ...overrides };
}

// ── Run examples ──

async function runExamples() {
  console.log('='.repeat(72));
  console.log('Player Identity Resolution — Example Cases');
  console.log('='.repeat(72));

  const store = new InMemoryIdentityStore();

  // Seed with "existing" players in our database
  const existingPlayers: CanonicalPlayer[] = [
    {
      internalId: 1,
      normalizedName: 'macklin celebrini',
      dateOfBirth: '2006-06-13',
      nationality: 'CA',
      position: 'C',
      league: 'NCAA',
      teamName: 'Boston University',
      sourceIds: { nhl_api: '8483432' },
    },
    {
      internalId: 2,
      normalizedName: 'matvei michkov',
      dateOfBirth: '2005-01-09',
      nationality: 'RU',
      position: 'RW',
      league: 'KHL',
      teamName: 'SKA Saint Petersburg',
      sourceIds: { ep: '598842' },
    },
    {
      internalId: 3,
      normalizedName: 'ivan demidov',
      dateOfBirth: '2006-01-14',
      nationality: 'RU',
      position: 'LW',
      league: 'KHL',
      teamName: 'SKA Saint Petersburg',
      sourceIds: { ep: '712345' },
    },
    {
      internalId: 4,
      normalizedName: 'michael misa',
      dateOfBirth: '2007-04-08',
      nationality: 'CA',
      position: 'C',
      league: 'OHL',
      teamName: 'Saginaw Spirit',
      sourceIds: { ohl: '9001' },
    },
    {
      internalId: 5,
      normalizedName: 'david reinbacher',
      dateOfBirth: '2005-03-21',
      nationality: 'AT',
      position: 'D',
      league: 'SHL',
      teamName: 'Kloten',
      sourceIds: { ep: '601234' },
    },
  ];

  store.seed(existingPlayers);
  const resolver = new PlayerIdentityResolver(store);

  // ── Case 1: Exact match via source ID ──
  console.log('\n--- Case 1: Exact match via source ID ---');
  const case1 = makePlayer({
    fullName: 'Macklin Celebrini',
    league: 'NCAA',
    sourceName: 'nhl_api',
    sourceIds: { nhl_api: '8483432' },
    dateOfBirth: '2006-06-13',
    nationality: 'CA',
    position: 'C',
  });
  const result1 = await resolver.resolve(case1);
  console.log(`  Player: ${case1.fullName}`);
  console.log(`  Action: ${result1.action} | Confidence: ${result1.confidence} | Method: ${result1.method}`);
  console.log(`  Internal ID: ${result1.internalPlayerId}`);

  // ── Case 2: Fuzzy name + DOB match (transliteration) ──
  console.log('\n--- Case 2: Fuzzy name match (transliteration) ---');
  const case2 = makePlayer({
    fullName: 'Matvei Michkov',  // Same player from different source
    normalizedName: 'matvei michkov',
    league: 'KHL',
    sourceName: 'hockeydb',
    sourceIds: { hockeydb: 'michkov-matvei' },
    dateOfBirth: '2005-01-09',
    nationality: 'RU',
    position: 'RW',
  });
  const result2 = await resolver.resolve(case2);
  console.log(`  Player: ${case2.fullName} (from HockeyDB)`);
  console.log(`  Action: ${result2.action} | Confidence: ${result2.confidence} | Method: ${result2.method}`);
  console.log(`  Internal ID: ${result2.internalPlayerId}`);
  console.log(`  Matched to: ${existingPlayers.find(p => p.internalId === result2.internalPlayerId)?.normalizedName}`);

  // ── Case 3: Accented name variant ──
  console.log('\n--- Case 3: Accented name variant ---');
  const case3 = makePlayer({
    fullName: 'Matvej Mickov',  // Different transliteration
    normalizedName: 'matvej mickov',
    league: 'KHL',
    sourceName: 'khl_scraper',
    sourceIds: { khl_scraper: 'player-10456' },
    dateOfBirth: '2005-01-09',
    nationality: 'RU',
    position: 'RW',
    teamName: 'SKA Saint Petersburg',
  });
  const result3 = await resolver.resolve(case3);
  console.log(`  Player: ${case3.fullName} (from KHL scraper)`);
  console.log(`  Action: ${result3.action} | Confidence: ${result3.confidence} | Method: ${result3.method}`);
  console.log(`  Internal ID: ${result3.internalPlayerId}`);
  if (result3.matchDetails) {
    console.log(`  Name score: ${result3.matchDetails.signals.nameScore}`);
    console.log(`  DOB score: ${result3.matchDetails.signals.dobScore}`);
  }

  // ── Case 4: Same name, different person (DOB mismatch) ──
  console.log('\n--- Case 4: Same name, different person (DOB mismatch) ---');
  const case4 = makePlayer({
    fullName: 'Michael Misa',
    normalizedName: 'michael misa',
    league: 'OHL',
    sourceName: 'ohl_scraper',
    sourceIds: { ohl_scraper: '9999' },
    dateOfBirth: '2009-11-15',  // Different DOB — different player
    nationality: 'CA',
    position: 'C',
  });
  const result4 = await resolver.resolve(case4);
  console.log(`  Player: ${case4.fullName} (DOB: ${case4.dateOfBirth})`);
  console.log(`  Existing: Michael Misa (DOB: 2007-04-08)`);
  console.log(`  Action: ${result4.action} | Confidence: ${result4.confidence} | Method: ${result4.method}`);
  console.log(`  → ${result4.action === 'create' ? 'Correctly identified as DIFFERENT player' : result4.action === 'flag' ? 'Flagged for review (DOB mismatch detected)' : 'Linked (may need review)'}`);

  // ── Case 5: Cross-league match (player moved) ──
  console.log('\n--- Case 5: Cross-league match (player moved leagues) ---');
  const case5 = makePlayer({
    fullName: 'David Reinbacher',
    normalizedName: 'david reinbacher',
    league: 'AHL',  // Moved from SHL to AHL
    sourceName: 'ahl_scraper',
    sourceIds: { ahl_scraper: 'reinbacher-david-123' },
    dateOfBirth: '2005-03-21',
    nationality: 'AT',
    position: 'D',
    teamName: 'Laval Rocket',
  });
  const result5 = await resolver.resolve(case5);
  console.log(`  Player: ${case5.fullName} (now in AHL)`);
  console.log(`  Action: ${result5.action} | Confidence: ${result5.confidence} | Method: ${result5.method}`);
  console.log(`  Internal ID: ${result5.internalPlayerId}`);
  console.log(`  → ${result5.internalPlayerId === 5 ? 'Correctly linked across leagues!' : 'Needs review'}`);

  // ── Case 6: Genuinely new player ──
  console.log('\n--- Case 6: New player (no match) ---');
  const case6 = makePlayer({
    fullName: 'Zeev Buium',
    normalizedName: 'zeev buium',
    league: 'NCAA',
    sourceName: 'ncaa_scraper',
    sourceIds: { ncaa_scraper: 'buium-zeev-2024' },
    dateOfBirth: '2006-01-09',
    nationality: 'US',
    position: 'D',
    teamName: 'Denver',
  });
  const result6 = await resolver.resolve(case6);
  console.log(`  Player: ${case6.fullName}`);
  console.log(`  Action: ${result6.action} | Confidence: ${result6.confidence}`);
  console.log(`  → ${result6.action === 'create' ? 'Correctly identified as NEW player' : 'Unexpected match found'}`);

  // ── Case 7: Initial-only first name ──
  console.log('\n--- Case 7: Initial-only first name ---');
  const case7 = makePlayer({
    fullName: 'M. Misa',
    normalizedName: 'm misa',
    league: 'OHL',
    sourceName: 'box_score',
    sourceIds: { box_score: 'misa-m-sag' },
    dateOfBirth: '2007-04-08',
    nationality: 'CA',
    position: 'C',
    teamName: 'Saginaw Spirit',
  });
  const result7 = await resolver.resolve(case7);
  console.log(`  Player: ${case7.fullName} (from box score)`);
  console.log(`  Action: ${result7.action} | Confidence: ${result7.confidence} | Method: ${result7.method}`);
  console.log(`  Internal ID: ${result7.internalPlayerId}`);

  // ── Summary ──
  console.log('\n' + '='.repeat(72));
  console.log('Summary');
  console.log('='.repeat(72));
  console.log(`  Players in store: ${store.getPlayerCount()}`);
  console.log(`  Identity links created: ${store.getLinks().length}`);
  console.log(`  Flagged matches: ${store.getFlaggedMatches().length}`);

  if (store.getFlaggedMatches().length > 0) {
    console.log('\n  Flagged for review:');
    for (const flag of store.getFlaggedMatches()) {
      console.log(`    - ${flag.sourcePlayer.fullName} (${flag.reason}, best confidence: ${flag.bestConfidence})`);
      for (const c of flag.candidates) {
        console.log(`      → Candidate: ${c.normalizedName} (confidence: ${c.confidence})`);
      }
    }
  }

  console.log('\nDone.');
}

// Run if executed directly
runExamples().catch(console.error);
