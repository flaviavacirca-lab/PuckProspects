// ============================================================================
// HockeyTech Leaguestat Common Utilities
// ============================================================================
// Shared parsing and fetching logic for leagues that use HockeyTech's
// Leaguestat platform. Many NA leagues use this system:
//   AHL, ECHL, OHL, WHL, QMJHL, USHL, NAHL, BCHL
//
// The HockeyTech JSON feed returns data at:
//   https://lscluster.hockeytech.com/feed/?feed=statviewfeed
//     &view=players&season=XXXXXXXX&league=xxx&sort=points
//     &key={client_key}&fmt=json
//
// The response is JSONP-wrapped: callback({...}) — we strip the wrapper.
// ============================================================================

import { FetchResult, ParsedRecord } from '../base';

export const HOCKEYTECH_BASE = 'https://lscluster.hockeytech.com/feed/';

/** Known HockeyTech client keys (embedded in league websites) */
export const HOCKEYTECH_KEYS: Record<string, string> = {
  ohl: '2976319eb44abe94',
  whl: '41b145a848f4bd67',
  qmjhl: 'f1aa699db3d81487',
  ahl: '50c2cd9b5e18e390',
  echl: '2b10938a1fdd1060',
  ushl: 'e828f89b243dc43f',
  nahl: '17e2f9f28ecc37c7',
  bchl: '19e3b8b625aeca40',
};

/** Season format: 2025-2026 → 20252026 */
export function htSeasonId(season: string): string {
  // "2025-2026" → "20252026"
  const match = season.match(/^(\d{4})-(\d{4})$/);
  if (match) return `${match[1]}${match[2]}`;
  // "2025-26" → "20252026"
  const short = season.match(/^(\d{4})-(\d{2})$/);
  if (short) return `${short[1]}20${short[2]}`;
  return season.replace(/-/g, '');
}

/** Build a HockeyTech stats feed URL */
export function buildHtUrl(params: {
  league: string;
  season: string;
  view?: 'players' | 'goalies';
  sort?: string;
  limit?: number;
}): string {
  const key = HOCKEYTECH_KEYS[params.league];
  if (!key) throw new Error(`No HockeyTech key for league: ${params.league}`);

  const seasonId = htSeasonId(params.season);
  const view = params.view || 'players';
  const sort = params.sort || 'points';

  const url = new URL(HOCKEYTECH_BASE);
  url.searchParams.set('feed', 'statviewfeed');
  url.searchParams.set('view', view);
  url.searchParams.set('season', seasonId);
  url.searchParams.set('league', params.league);
  url.searchParams.set('sort', sort);
  url.searchParams.set('key', key);
  url.searchParams.set('fmt', 'json');
  url.searchParams.set('client_code', params.league);
  url.searchParams.set('lang', 'en');
  if (params.limit) {
    url.searchParams.set('limit', String(params.limit));
  }

  return url.toString();
}

/** Strip JSONP wrapper and parse the response */
export function parseHtResponse(rawBody: string): HtStatsResponse | null {
  try {
    // Response is often JSONP: SomeCallback({...})
    // Strip the callback wrapper to get plain JSON
    let json = rawBody.trim();
    const cbMatch = json.match(/^\w+\(([\s\S]+)\);?\s*$/);
    if (cbMatch) {
      json = cbMatch[1];
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// --- HockeyTech response types ---

export interface HtStatsResponse {
  SiteKit?: {
    Statviewtype?: HtPlayerRow[];
  };
  // Some feeds use a different structure
  [key: string]: unknown;
}

export interface HtPlayerRow {
  player_id: string;
  first_name: string;
  last_name: string;
  name: string; // "LastName, FirstName" format
  position: string;
  birthdate?: string;
  birth_date?: string;
  birthplace?: string;
  height?: string;
  weight?: string;
  shoots?: string;
  team_name?: string;
  team_code?: string;
  rookie?: string;
  active?: string;
  // Skater stats
  games_played?: string;
  goals?: string;
  assists?: string;
  points?: string;
  penalty_minutes?: string;
  plus_minus?: string;
  power_play_goals?: string;
  power_play_assists?: string;
  short_handed_goals?: string;
  short_handed_assists?: string;
  shots?: string;
  shooting_percentage?: string;
  game_winning_goals?: string;
  // Goalie stats
  wins?: string;
  losses?: string;
  ot_losses?: string;
  shutouts?: string;
  saves?: string;
  goals_against?: string;
  goals_against_average?: string;
  save_percentage?: string;
  shots_against?: string;
  minutes_played?: string;
  games_started?: string;
  // Identity
  playerpage?: string; // URL path to player profile
  nationality?: string;
}

/** Parse HockeyTech player rows into ParsedRecords */
export function htRowsToRecords(
  rows: HtPlayerRow[],
  league: string,
  recordType: 'skater' | 'goalie'
): ParsedRecord[] {
  return rows.map(row => ({
    sourcePlayerId: row.player_id || '',
    recordType,
    fields: {
      // Identity
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      fullName: row.name || `${row.last_name}, ${row.first_name}`,
      position: row.position || null,
      birthDate: row.birthdate || row.birth_date || null,
      birthplace: row.birthplace || null,
      height: row.height || null,
      weight: row.weight || null,
      shootsCatches: row.shoots || null,
      teamName: row.team_name || null,
      teamCode: row.team_code || null,
      nationality: row.nationality || null,
      isRookie: row.rookie === '1',
      playerPageUrl: row.playerpage || null,
      // Stats
      gamesPlayed: row.games_played || '0',
      goals: row.goals || '0',
      assists: row.assists || '0',
      points: row.points || '0',
      penaltyMinutes: row.penalty_minutes || '0',
      plusMinus: row.plus_minus || '0',
      ppGoals: row.power_play_goals || null,
      ppAssists: row.power_play_assists || null,
      shGoals: row.short_handed_goals || null,
      shAssists: row.short_handed_assists || null,
      shots: row.shots || null,
      shootingPct: row.shooting_percentage || null,
      gwGoals: row.game_winning_goals || null,
      // Goalie-specific
      wins: row.wins || null,
      losses: row.losses || null,
      otLosses: row.ot_losses || null,
      shutouts: row.shutouts || null,
      saves: row.saves || null,
      goalsAgainst: row.goals_against || null,
      goalsAgainstAvg: row.goals_against_average || null,
      savePct: row.save_percentage || null,
      shotsAgainst: row.shots_against || null,
      minutesPlayed: row.minutes_played || null,
      gamesStarted: row.games_started || null,
      // Raw reference
      htPlayerId: row.player_id,
      league,
    },
  }));
}
