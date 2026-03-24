// ============================================================================
// SHL (Swedish Hockey League) Connector — IMPLEMENTED
// ============================================================================
// Source: https://www.shl.se/statistik
// Type: hybrid (shl.se uses an open JSON API at openapi.shl.se)
// Maturity: implemented
//
// The SHL provides an open API at openapi.shl.se that returns JSON.
// We use the statistics endpoint to fetch player stats.
//
// Key endpoints:
//   GET https://openapi.shl.se/seasons/{seasonId}/statistics/players
//     ?sort=points
//
// The API is publicly accessible without authentication for basic stats.
// Season IDs are numeric (e.g., 2025 for the 2025-26 season).
//
// SHL is a top European league with many NHL-caliber prospects.
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
  calculateAge,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
  createEmptyGoalieStats,
} from '../../core/normalization';
import { registry } from '../registry';

const LEAGUE = 'shl';

// SHL API base — the public open API
const SHL_API = 'https://openapi.shl.se';

// SHL season ID format: just the start year (2025 for 2025-26)
function shlSeasonId(season: string): number {
  const match = season.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : 2025;
}

interface ShlPlayerStat {
  player: {
    id: number;
    first_name: string;
    last_name: string;
    nationality?: string;
    position?: string;
    date_of_birth?: string;
    height?: number; // cm
    weight?: number; // kg
    shoots?: string;
  };
  team: {
    code: string;
    name?: string;
  };
  games_played?: number;
  goals?: number;
  assists?: number;
  points?: number;
  penalty_minutes?: number;
  plus_minus?: number;
  // Goalie fields
  goals_against?: number;
  goals_against_average?: number;
  saves?: number;
  saves_percent?: number;
  shutouts?: number;
  wins?: number;
  losses?: number;
  overtime_losses?: number;
}

export class ShlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'shl',
    sourceType: 'hybrid',
    sourceUrl: 'https://www.shl.se/statistik',
    league: LEAGUE,
    ingestionCadence: 'daily',
    maturity: 'implemented',
    tier: 2,
    knownLimitations: [
      'Open API may change without notice',
      'Season ID is just the start year',
      'Swedish character encoding in names',
      'Statistics may lag behind live games',
      'No special teams breakdown in basic stats endpoint',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: true,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  private season: string;

  constructor(season = '2025-2026') {
    super();
    this.season = season;
  }

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];
    const seasonId = shlSeasonId(this.season);

    // Fetch player stats (skaters)
    const playerUrl = `${SHL_API}/seasons/${seasonId}/statistics/players?sort=points`;
    const playerResult = await this.fetchUrl(playerUrl, {
      headers: { 'Accept': 'application/json' },
      retries: 2,
      timeout: 20000,
    });

    if (playerResult && playerResult.status === 200 && playerResult.body) {
      results.push({
        rawBody: playerResult.body,
        contentType: 'json',
        httpStatus: playerResult.status,
        url: playerUrl,
        fetchedAt: new Date(),
      });
    }

    // Fetch goalie stats
    const goalieUrl = `${SHL_API}/seasons/${seasonId}/statistics/goalkeepers?sort=saves_percent`;
    const goalieResult = await this.fetchUrl(goalieUrl, {
      headers: { 'Accept': 'application/json' },
      retries: 2,
      timeout: 20000,
    });

    if (goalieResult && goalieResult.status === 200 && goalieResult.body) {
      results.push({
        rawBody: goalieResult.body,
        contentType: 'json',
        httpStatus: goalieResult.status,
        url: goalieUrl,
        fetchedAt: new Date(),
      });
    }

    // If the open API fails, fall back to scraping shl.se
    if (results.length === 0) {
      const fallbackUrl = 'https://www.shl.se/statistik/spelareSort/all/points/all/regular';
      const fallbackResult = await this.fetchUrl(fallbackUrl, { retries: 1, timeout: 20000 });
      if (fallbackResult && fallbackResult.status === 200) {
        results.push({
          rawBody: fallbackResult.body,
          contentType: 'html',
          httpStatus: fallbackResult.status,
          url: fallbackUrl,
          fetchedAt: new Date(),
        });
      }
    }

    if (results.length === 0) {
      throw new Error('SHL: Failed to fetch data from both API and website');
    }

    return results;
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      if (fetchResult.contentType === 'json') {
        records.push(...this.parseJsonFeed(fetchResult));
      }
      // HTML fallback parsing could go here if needed
    }

    return records;
  }

  private parseJsonFeed(fetchResult: FetchResult): ParsedRecord[] {
    const records: ParsedRecord[] = [];
    let data: ShlPlayerStat[];

    try {
      data = JSON.parse(fetchResult.rawBody);
    } catch {
      return records;
    }

    if (!Array.isArray(data)) return records;

    const isGoalie = fetchResult.url.includes('goalkeepers');

    for (const entry of data) {
      const p = entry.player;
      if (!p || !p.first_name || !p.last_name) continue;

      records.push({
        sourcePlayerId: String(p.id),
        recordType: isGoalie ? 'goalie' : 'skater',
        fields: {
          shlId: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          position: p.position || null,
          nationality: p.nationality || null,
          dateOfBirth: p.date_of_birth || null,
          heightCm: p.height || null,
          weightKg: p.weight || null,
          shootsCatches: p.shoots || null,
          teamCode: entry.team?.code || null,
          teamName: entry.team?.name || null,
          // Stats
          gamesPlayed: entry.games_played,
          goals: entry.goals,
          assists: entry.assists,
          points: entry.points,
          penaltyMinutes: entry.penalty_minutes,
          plusMinus: entry.plus_minus,
          // Goalie
          goalsAgainst: entry.goals_against,
          goalsAgainstAvg: entry.goals_against_average,
          saves: entry.saves,
          savePct: entry.saves_percent,
          shutouts: entry.shutouts,
          wins: entry.wins,
          losses: entry.losses,
          otLosses: entry.overtime_losses,
        },
      });
    }

    return records;
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    const players: NormalizedPlayer[] = [];
    const skaterStats: NormalizedSkaterStats[] = [];
    const goalieStats: NormalizedGoalieStats[] = [];
    const snapshot = todaySnapshot();
    const season = this.normalizeSeason(this.season);

    for (const record of parsed) {
      const f = record.fields;
      const firstName = f.firstName as string;
      const lastName = f.lastName as string;
      const fullName = `${firstName} ${lastName}`.trim();
      if (!fullName || fullName.length < 2) continue;

      // Build player
      const player = createEmptyPlayer('shl', LEAGUE);
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizePosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.handedness = normalizeHandedness(f.shootsCatches as string | null);
      player.teamName = (f.teamName as string) || (f.teamCode as string) || null;
      player.nationality = normalizeNationality(f.nationality as string);

      // Physical — SHL API returns height in cm and weight in kg directly
      if (f.heightCm && typeof f.heightCm === 'number') {
        player.heightCm = f.heightCm;
      }
      if (f.weightKg && typeof f.weightKg === 'number') {
        player.weightKg = f.weightKg;
      }

      // Birth date
      if (f.dateOfBirth) {
        player.dateOfBirth = f.dateOfBirth as string;
        player.age = calculateAge(player.dateOfBirth);
      }

      player.birthCountry = player.nationality;
      player.sourceIds['shl'] = String(f.shlId);
      player.snapshotDate = snapshot;

      const missing: string[] = [];
      if (!player.dateOfBirth) missing.push('dateOfBirth');
      if (!player.heightCm) missing.push('heightCm');
      if (!player.weightKg) missing.push('weightKg');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);

      // Build stats
      if (record.recordType === 'skater') {
        const stat = createEmptySkaterStats('shl', LEAGUE, season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.goals = safeInt(f.goals) || 0;
        stat.assists = safeInt(f.assists) || 0;
        stat.points = safeInt(f.points) || stat.goals + stat.assists;
        stat.penaltyMinutes = safeInt(f.penaltyMinutes);
        stat.plusMinus = safeInt(f.plusMinus);
        stat.pointsPerGame = stat.gamesPlayed > 0
          ? Math.round((stat.points / stat.gamesPlayed) * 100) / 100
          : 0;
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;

        const statMissing: string[] = [];
        if (stat.plusMinus === null) statMissing.push('plusMinus');
        stat.dataQuality = createDefaultQuality(statMissing);

        skaterStats.push(stat);
      } else if (record.recordType === 'goalie') {
        const stat = createEmptyGoalieStats('shl', LEAGUE, season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.wins = safeInt(f.wins) || 0;
        stat.losses = safeInt(f.losses) || 0;
        stat.otl = safeInt(f.otLosses);
        stat.shutouts = safeInt(f.shutouts);
        stat.saves = safeInt(f.saves);
        stat.goalsAgainst = safeInt(f.goalsAgainst);
        stat.goalsAgainstAvg = safeFloat(f.goalsAgainstAvg);
        stat.savePct = safeFloat(f.savePct);
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;
        stat.dataQuality = createDefaultQuality();

        goalieStats.push(stat);
      }
    }

    return { players, skaterStats, goalieStats };
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const seasonId = shlSeasonId(this.season);
    const url = `${SHL_API}/seasons/${seasonId}/statistics/players?sort=points`;
    const result = await this.fetchUrl(url, {
      headers: { 'Accept': 'application/json' },
      retries: 0,
      timeout: 10000,
    });
    if (!result) return { healthy: false, message: 'SHL API unreachable' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    try {
      const data = JSON.parse(result.body);
      if (Array.isArray(data)) {
        return { healthy: true, message: `OK (${data.length} player rows)` };
      }
    } catch { /* fall through */ }
    return { healthy: false, message: 'Unexpected response format' };
  }
}

function normalizeHandedness(val: string | null | undefined): 'L' | 'R' | null {
  if (!val) return null;
  const c = val.toUpperCase().charAt(0);
  return c === 'L' ? 'L' : c === 'R' ? 'R' : null;
}

registry.register('shl', () => new ShlConnector());
