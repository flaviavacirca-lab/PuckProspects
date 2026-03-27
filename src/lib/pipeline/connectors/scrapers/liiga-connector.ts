// ============================================================================
// Liiga (Finnish Elite League) Connector — IMPLEMENTED
// ============================================================================
// Source: https://liiga.fi/en/statistics
// Type: hybrid (internal JSON API)
// Maturity: implemented
//
// Liiga's website fetches stats via an internal API. The English-language
// site at liiga.fi makes XHR requests to endpoints like:
//   https://liiga.fi/api/v1/players/stats/regular-season/2025
//
// The response is a JSON array of player stat objects with Finnish
// and English fields. Player names often include Finnish characters
// (ä, ö, å) which are handled by our normalization layer.
//
// Liiga is a top European development league — many NHL draft picks
// play here, including stars like Barkov, Rantanen, and Laine.
//
// Limitations:
// - API endpoints are undocumented / unofficial (discovered via network tab)
// - Season parameter format is just the start year (2025 for 2025-26)
// - No DOB in the stats endpoint — would need player profile scraping
// - Nationality sometimes in Finnish (e.g. "Suomi" = Finland)
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
} from '../../core/normalization';
import { registry } from '../registry';

const LIIGA_API_BASE = 'https://liiga.fi/api/v1';
const SEASON_YEAR = '2025'; // Liiga uses just the start year

// ── Liiga API response types ──

interface LiigaPlayerStats {
  id: number;
  firstName: string;
  lastName: string;
  team: {
    id: number;
    name: string;
    shortName?: string;
  };
  position: string;  // 'HY' (forward), 'PU' (defender), 'MV' (goalie)
  nationality?: string;
  jersey?: number;
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  points?: number;
  penaltyMinutes?: number;
  plusMinus?: number;
  powerPlayGoals?: number;
  shortHandedGoals?: number;
  gameWinningGoals?: number;
  shots?: number;
  faceoffsWon?: number;
  faceoffsLost?: number;
  averagePlayingTime?: string; // "MM:SS" format
  // Goalie fields
  wins?: number;
  losses?: number;
  overtimeLosses?: number;
  shutouts?: number;
  goalsAgainst?: number;
  goalsAgainstAverage?: number;
  saves?: number;
  savesAgainst?: number;
  savePercentage?: number;
  minutesPlayed?: number;
  gamesStarted?: number;
}

// ── Connector ──

export class LiigaConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'liiga',
    sourceType: 'hybrid',
    sourceUrl: 'https://liiga.fi/en/statistics',
    league: 'liiga',
    ingestionCadence: 'daily',
    maturity: 'implemented',
    tier: 2,
    knownLimitations: [
      'Internal API — endpoints may change without notice',
      'No DOB in stats endpoint — needs player profile for birth date',
      'Finnish nationality values (Suomi, Ruotsi) mapped to ISO codes',
      'Position codes are Finnish (HY=forward, PU=defender, MV=goalie)',
      'Season parameter is just start year (2025 for 2025-26)',
      'TOI format is "MM:SS" — converted to minutes decimal',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: true,
      hasIceTime: true,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: false, // No DOB or height/weight in stats endpoint
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  private seasonYear: string;

  constructor(seasonYear = SEASON_YEAR) {
    super();
    this.seasonYear = seasonYear;
  }

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];
    const headers = {
      'Accept': 'application/json',
      'Accept-Language': 'en',
    };

    // Fetch skater stats
    const skaterUrl = `${LIIGA_API_BASE}/players/stats/regular-season/${this.seasonYear}`;
    const skaterResult = await this.fetchUrl(skaterUrl, {
      headers,
      retries: 2,
      timeout: 30000,
    });

    if (skaterResult && skaterResult.status === 200 && skaterResult.body) {
      results.push({
        rawBody: skaterResult.body,
        contentType: 'json',
        httpStatus: skaterResult.status,
        url: skaterUrl,
        fetchedAt: new Date(),
      });
    }

    // Fetch goalie stats (separate endpoint)
    const goalieUrl = `${LIIGA_API_BASE}/goalies/stats/regular-season/${this.seasonYear}`;
    const goalieResult = await this.fetchUrl(goalieUrl, {
      headers,
      retries: 2,
      timeout: 30000,
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

    if (results.length === 0) {
      throw new Error('[liiga] Failed to fetch any data from Liiga API');
    }

    return results;
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      let data: LiigaPlayerStats[];
      try {
        data = JSON.parse(fetchResult.rawBody);
      } catch {
        continue;
      }

      if (!Array.isArray(data)) continue;

      const isGoalie = fetchResult.url.includes('/goalies/');

      for (const row of data) {
        records.push({
          sourcePlayerId: String(row.id),
          recordType: isGoalie ? 'goalie' : 'skater',
          fields: {
            // Identity
            firstName: row.firstName || '',
            lastName: row.lastName || '',
            position: row.position || '',
            nationality: row.nationality || null,
            teamName: row.team?.name || null,
            teamShortName: row.team?.shortName || null,
            teamId: row.team?.id || null,
            jersey: row.jersey || null,
            liigaPlayerId: String(row.id),
            // Skater stats
            gamesPlayed: String(row.gamesPlayed || 0),
            goals: String(row.goals ?? 0),
            assists: String(row.assists ?? 0),
            points: String(row.points ?? 0),
            penaltyMinutes: String(row.penaltyMinutes ?? 0),
            plusMinus: String(row.plusMinus ?? 0),
            ppGoals: row.powerPlayGoals != null ? String(row.powerPlayGoals) : null,
            shGoals: row.shortHandedGoals != null ? String(row.shortHandedGoals) : null,
            gwGoals: row.gameWinningGoals != null ? String(row.gameWinningGoals) : null,
            shots: row.shots != null ? String(row.shots) : null,
            faceoffsWon: row.faceoffsWon != null ? String(row.faceoffsWon) : null,
            faceoffsLost: row.faceoffsLost != null ? String(row.faceoffsLost) : null,
            avgToi: row.averagePlayingTime || null,
            // Goalie stats
            wins: row.wins != null ? String(row.wins) : null,
            losses: row.losses != null ? String(row.losses) : null,
            otLosses: row.overtimeLosses != null ? String(row.overtimeLosses) : null,
            shutouts: row.shutouts != null ? String(row.shutouts) : null,
            goalsAgainst: row.goalsAgainst != null ? String(row.goalsAgainst) : null,
            goalsAgainstAvg: row.goalsAgainstAverage != null ? String(row.goalsAgainstAverage) : null,
            saves: row.saves != null ? String(row.saves) : null,
            shotsAgainst: row.savesAgainst != null ? String(row.savesAgainst) : null,
            savePct: row.savePercentage != null ? String(row.savePercentage) : null,
            minutesPlayed: row.minutesPlayed != null ? String(row.minutesPlayed) : null,
            gamesStarted: row.gamesStarted != null ? String(row.gamesStarted) : null,
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
    const skaterStats: NormalizedSkaterStats[] = [];
    const goalieStats: NormalizedGoalieStats[] = [];
    const snapshot = todaySnapshot();
    const season = `${this.seasonYear}-${parseInt(this.seasonYear, 10) + 1}`;

    for (const record of parsed) {
      const f = record.fields;
      const firstName = f.firstName as string;
      const lastName = f.lastName as string;
      const fullName = `${firstName} ${lastName}`.trim();
      if (!fullName || fullName.length < 2) continue;

      // Build player
      const player = createEmptyPlayer('liiga', 'liiga');
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizeLiigaPosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.teamName = (f.teamName as string) || null;
      player.nationality = normalizeFinnishNationality(f.nationality as string);

      // Source ID
      player.sourceIds['liiga'] = f.liigaPlayerId as string;

      player.snapshotDate = snapshot;

      // Quality — no DOB or height/weight from stats endpoint
      const missing: string[] = ['dateOfBirth', 'heightCm', 'weightKg'];
      if (!player.nationality) missing.push('nationality');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);

      // Build stats
      if (record.recordType === 'skater') {
        const stat = createEmptySkaterStats('liiga', 'liiga', season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.goals = safeInt(f.goals) || 0;
        stat.assists = safeInt(f.assists) || 0;
        stat.points = safeInt(f.points) || stat.goals + stat.assists;
        stat.penaltyMinutes = safeInt(f.penaltyMinutes);
        stat.plusMinus = safeInt(f.plusMinus);
        stat.ppGoals = safeInt(f.ppGoals);
        stat.shGoals = safeInt(f.shGoals);
        stat.gwGoals = safeInt(f.gwGoals);
        stat.shots = safeInt(f.shots);
        stat.shootingPct = stat.shots && stat.shots > 0
          ? Math.round((stat.goals / stat.shots) * 1000) / 10
          : null;

        // Faceoffs
        stat.faceoffWins = safeInt(f.faceoffsWon);
        stat.faceoffLosses = safeInt(f.faceoffsLost);
        if (stat.faceoffWins !== null && stat.faceoffLosses !== null) {
          const total = stat.faceoffWins + stat.faceoffLosses;
          stat.faceoffPct = total > 0
            ? Math.round((stat.faceoffWins / total) * 1000) / 10
            : null;
        }

        // TOI — "MM:SS" → decimal minutes
        stat.avgToi = parseToiMinutes(f.avgToi as string | null);

        stat.pointsPerGame = stat.gamesPlayed > 0
          ? Math.round((stat.points / stat.gamesPlayed) * 100) / 100
          : 0;
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;
        stat.dataQuality = createDefaultQuality();

        skaterStats.push(stat);
      } else if (record.recordType === 'goalie') {
        const stat = createEmptyGoalieStats('liiga', 'liiga', season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.gamesStarted = safeInt(f.gamesStarted);
        stat.wins = safeInt(f.wins) || 0;
        stat.losses = safeInt(f.losses) || 0;
        stat.otl = safeInt(f.otLosses);
        stat.shutouts = safeInt(f.shutouts);
        stat.goalsAgainst = safeInt(f.goalsAgainst);
        stat.goalsAgainstAvg = safeFloat(f.goalsAgainstAvg);
        stat.saves = safeInt(f.saves);
        stat.shotsAgainst = safeInt(f.shotsAgainst);
        stat.savePct = safeFloat(f.savePct);
        stat.minutesPlayed = safeInt(f.minutesPlayed);
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;
        stat.dataQuality = createDefaultQuality();

        goalieStats.push(stat);
      }
    }

    return { players, skaterStats, goalieStats };
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const url = `${LIIGA_API_BASE}/players/stats/regular-season/${this.seasonYear}`;
    const result = await this.fetchUrl(url, {
      headers: { 'Accept': 'application/json' },
      retries: 0,
      timeout: 10000,
    });
    if (!result) return { healthy: false, message: 'Liiga API unreachable' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    try {
      const data = JSON.parse(result.body);
      if (!Array.isArray(data)) return { healthy: false, message: 'Unexpected response (not an array)' };
      return { healthy: true, message: `OK (${data.length} players)` };
    } catch {
      return { healthy: false, message: 'Invalid JSON response' };
    }
  }
}

// ── Liiga-specific helpers ──

/**
 * Normalize Liiga position codes.
 * Liiga uses Finnish abbreviations: HY (hyökkääjä=forward), PU (puolustaja=defender), MV (maalivahti=goalie)
 * Some feeds also use C, LW, RW, D, G directly.
 */
function normalizeLiigaPosition(pos: string | null): string | null {
  if (!pos) return null;
  const upper = pos.toUpperCase().trim();
  switch (upper) {
    case 'HY': return 'F';    // Hyökkääjä (forward)
    case 'PU': return 'D';    // Puolustaja (defender)
    case 'MV': return 'G';    // Maalivahti (goalie)
    case 'KH': return 'C';    // Keskushyökkääjä (center)
    case 'VL': return 'LW';   // Vasenlaitahyökkääjä (left wing)
    case 'OL': return 'RW';   // Oikealaitahyökkääjä (right wing)
    default: return normalizePosition(upper);
  }
}

/**
 * Normalize Finnish nationality values to ISO codes.
 */
function normalizeFinnishNationality(nat: string | null): string | null {
  if (!nat) return null;
  const lower = nat.toLowerCase().trim();
  const FINNISH_NATIONALITIES: Record<string, string> = {
    'suomi': 'FI',
    'finland': 'FI',
    'ruotsi': 'SE',
    'sweden': 'SE',
    'kanada': 'CA',
    'canada': 'CA',
    'usa': 'US',
    'yhdysvallat': 'US',
    'venäjä': 'RU',
    'russia': 'RU',
    'tšekki': 'CZ',
    'czechia': 'CZ',
    'sveitsi': 'CH',
    'switzerland': 'CH',
    'norja': 'NO',
    'norway': 'NO',
    'tanska': 'DK',
    'denmark': 'DK',
    'saksa': 'DE',
    'germany': 'DE',
    'itävalta': 'AT',
    'austria': 'AT',
    'slovakia': 'SK',
    'latvia': 'LV',
  };
  return FINNISH_NATIONALITIES[lower] || normalizeNationality(nat);
}

/**
 * Parse "MM:SS" time-on-ice to decimal minutes.
 */
function parseToiMinutes(toi: string | null): number | null {
  if (!toi) return null;
  const match = toi.match(/^(\d+):(\d+)$/);
  if (!match) return safeFloat(toi);
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return Math.round((minutes + seconds / 60) * 100) / 100;
}

registry.register('liiga', () => new LiigaConnector());
