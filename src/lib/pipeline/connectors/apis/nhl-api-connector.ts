// ============================================================================
// NHL Unofficial API Connector — IMPLEMENTED
// ============================================================================
// Source: https://api-web.nhle.com
// Type: API (unofficial, no key required)
// Maturity: implemented
//
// Fetches NHL prospect pool data from the unofficial NHL web API.
// This API powers nhle.com and provides rich JSON data on:
//   - NHL draft prospects (by team)
//   - Player biographical data
//   - Draft history
//   - NHL team affiliations
//
// Strategy:
//   1. Fetch all NHL team abbreviations
//   2. For each team, fetch /v1/prospects/{team}
//   3. Parse the JSON prospect data
//   4. Normalize into our pipeline schema
//
// Limitations:
//   - Only covers players with NHL draft/rights connections
//   - Does not cover undrafted free agents or pre-draft eligible players
//   - API is unofficial — schema can change without notice
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import {
  normalizeName,
  normalizePosition,
  normalizeNationality,
  safeInt,
  safeFloat,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
  createEmptyGoalieStats,
  calculateAge,
} from '../../core/normalization';
import { registry } from '../registry';

const API_BASE = 'https://api-web.nhle.com';

// All 32 NHL team abbreviations
const NHL_TEAMS = [
  'ANA', 'ARI', 'BOS', 'BUF', 'CGY', 'CAR', 'CHI', 'COL',
  'CBJ', 'DAL', 'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL',
  'NSH', 'NJD', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SEA',
  'SJS', 'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK', 'WPG',
];

// Prospect position code mapping (NHL API uses specific codes)
const POSITION_MAP: Record<string, string> = {
  'C': 'C', 'L': 'LW', 'R': 'RW', 'D': 'D', 'G': 'G',
};

interface NhlProspectResponse {
  forwards?: NhlProspect[];
  defensemen?: NhlProspect[];
  goalies?: NhlProspect[];
}

interface NhlProspect {
  id: number;
  headshot?: string;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber?: number;
  positionCode: string;
  shootsCatches?: string;
  heightInInches?: number;
  weightInPounds?: number;
  birthDate?: string;
  birthCity?: { default: string };
  birthCountry?: string;
  birthStateProvince?: { default: string };
  nhlTeamAbbrev?: string;
  currentTeamAbbrev?: string;
  currentTeamName?: { default: string };
  leagueAbbrev?: string;
  draftYear?: number;
  draftTeam?: string;
  draftRound?: number;
  draftPickInRound?: number;
  draftOverallPick?: number;
}

export class NhlApiConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'nhl_api',
    sourceType: 'api',
    sourceUrl: API_BASE,
    league: '*',
    ingestionCadence: 'daily',
    maturity: 'implemented',
    tier: 1,
    leaguesCovered: ['ahl', 'ohl', 'whl', 'qmjhl', 'ncaa', 'ushl', 'shl', 'liiga', 'khl'],
    knownLimitations: [
      'Unofficial API — no stability guarantees',
      'Only covers players with NHL draft/rights connections',
      'Does not cover undrafted prospects',
      'Response schema can change without notice',
    ],
    fieldCoverage: {
      hasBasicStats: false, // Prospect endpoint has bio, not season stats
      hasPlusMinus: false,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: false,
      hasBiographicalData: true,
      hasDraftInfo: true,
      hasNhlAffiliation: true,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    // Fetch prospects for each NHL team
    // We batch and add small delays to avoid overloading the API
    for (let i = 0; i < NHL_TEAMS.length; i++) {
      const team = NHL_TEAMS[i];
      const url = `${API_BASE}/v1/prospects/${team}`;

      const result = await this.fetchUrl(url, {
        headers: { 'Accept': 'application/json' },
        retries: 1,
        timeout: 15000,
      });

      if (result && result.status === 200 && result.body) {
        results.push({
          rawBody: result.body,
          contentType: 'json',
          httpStatus: result.status,
          url,
          fetchedAt: new Date(),
        });
      }

      // Small delay between teams (100ms) to be respectful
      if (i < NHL_TEAMS.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    if (results.length === 0) {
      throw new Error('NHL API: No prospect data fetched from any team');
    }

    return results;
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];
    const seenIds = new Set<number>();

    for (const fetchResult of raw) {
      let data: NhlProspectResponse;
      try {
        data = JSON.parse(fetchResult.rawBody);
      } catch {
        continue;
      }

      // Extract team abbrev from URL: /v1/prospects/TOR → TOR
      const teamMatch = fetchResult.url.match(/\/prospects\/([A-Z]{3})$/);
      const nhlTeam = teamMatch ? teamMatch[1] : null;

      // Process forwards, defensemen, goalies
      const allProspects: Array<{ prospect: NhlProspect; type: 'skater' | 'goalie' }> = [];
      if (data.forwards) {
        allProspects.push(...data.forwards.map(p => ({ prospect: p, type: 'skater' as const })));
      }
      if (data.defensemen) {
        allProspects.push(...data.defensemen.map(p => ({ prospect: p, type: 'skater' as const })));
      }
      if (data.goalies) {
        allProspects.push(...data.goalies.map(p => ({ prospect: p, type: 'goalie' as const })));
      }

      for (const { prospect, type } of allProspects) {
        // Deduplicate across teams (shouldn't happen, but safety)
        if (seenIds.has(prospect.id)) continue;
        seenIds.add(prospect.id);

        records.push({
          sourcePlayerId: String(prospect.id),
          recordType: type === 'goalie' ? 'goalie' : 'bio', // bio because we get identity, not stats
          fields: {
            nhlId: prospect.id,
            firstName: prospect.firstName?.default || '',
            lastName: prospect.lastName?.default || '',
            positionCode: prospect.positionCode,
            shootsCatches: prospect.shootsCatches || null,
            heightInInches: prospect.heightInInches || null,
            weightInPounds: prospect.weightInPounds || null,
            birthDate: prospect.birthDate || null,
            birthCity: prospect.birthCity?.default || null,
            birthCountry: prospect.birthCountry || null,
            birthStateProvince: prospect.birthStateProvince?.default || null,
            nhlRightsTeam: nhlTeam,
            currentTeamAbbrev: prospect.currentTeamAbbrev || null,
            currentTeamName: prospect.currentTeamName?.default || null,
            leagueAbbrev: prospect.leagueAbbrev || null,
            draftYear: prospect.draftYear || null,
            draftRound: prospect.draftRound || null,
            draftPickInRound: prospect.draftPickInRound || null,
            draftOverallPick: prospect.draftOverallPick || null,
            headshot: prospect.headshot || null,
          },
        });
      }
    }

    return records;
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    const players: NormalizedPlayer[] = [];
    const snapshot = todaySnapshot();

    for (const record of parsed) {
      const f = record.fields;
      const firstName = f.firstName as string;
      const lastName = f.lastName as string;
      const fullName = `${firstName} ${lastName}`.trim();
      if (!fullName) continue;

      // Determine which league the prospect currently plays in
      const leagueAbbrev = (f.leagueAbbrev as string || '').toLowerCase();

      const player = createEmptyPlayer('nhl_api', leagueAbbrev || '*');
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);

      // Position
      const posCode = f.positionCode as string;
      player.position = POSITION_MAP[posCode] || normalizePosition(posCode);
      player.positionGroup = this.getPositionGroup(player.position);

      // Physical
      player.handedness = normalizeHandedness(f.shootsCatches as string | null);
      if (f.heightInInches) {
        player.heightCm = Math.round((f.heightInInches as number) * 2.54);
      }
      if (f.weightInPounds) {
        player.weightKg = Math.round((f.weightInPounds as number) * 0.453592);
      }

      // Birth info
      player.dateOfBirth = (f.birthDate as string) || null;
      player.age = calculateAge(player.dateOfBirth);
      player.birthCity = (f.birthCity as string) || null;
      player.birthCountry = normalizeNationality(f.birthCountry as string) || null;
      player.nationality = player.birthCountry;

      // Draft info
      if (f.draftYear) {
        player.draftYear = f.draftYear as number;
        player.draftRound = (f.draftRound as number) || null;
        player.draftPick = (f.draftPickInRound as number) || null;
        player.draftOverall = (f.draftOverallPick as number) || null;
        player.draftStatus = 'drafted';
      }

      // NHL affiliation
      player.nhlRightsHolder = (f.nhlRightsTeam as string) || null;
      player.draftedBy = player.nhlRightsHolder;
      player.teamName = (f.currentTeamName as string) || null;

      // Source IDs
      player.sourceIds['nhl_api'] = String(f.nhlId);

      // Custom fields
      player.customFields = {
        headshot: f.headshot,
        currentLeague: f.leagueAbbrev,
      };

      player.snapshotDate = snapshot;

      // Quality assessment
      const missing: string[] = [];
      if (!player.dateOfBirth) missing.push('dateOfBirth');
      if (!player.heightCm) missing.push('heightCm');
      if (!player.weightKg) missing.push('weightKg');
      if (!player.position) missing.push('position');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);
    }

    // This connector provides bio/identity data, not season stats
    return { players, skaterStats: [], goalieStats: [] };
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const result = await this.fetchUrl(`${API_BASE}/v1/prospects/TOR`, {
      retries: 0,
      timeout: 10000,
      headers: { 'Accept': 'application/json' },
    });
    if (!result) return { healthy: false, message: 'Connection failed' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    try {
      const data = JSON.parse(result.body);
      const count = (data.forwards?.length || 0) + (data.defensemen?.length || 0) + (data.goalies?.length || 0);
      return { healthy: true, message: `OK (${count} TOR prospects)` };
    } catch {
      return { healthy: false, message: 'Invalid JSON response' };
    }
  }
}

function normalizeHandedness(val: string | null | undefined): 'L' | 'R' | null {
  if (!val) return null;
  const c = val.toUpperCase().charAt(0);
  return c === 'L' ? 'L' : c === 'R' ? 'R' : null;
}

registry.register('nhl_api', () => new NhlApiConnector());
