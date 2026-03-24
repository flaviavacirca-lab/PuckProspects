// ============================================================================
// OHL Connector — IMPLEMENTED
// ============================================================================
// Source: https://ontariohockeyleague.com/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: implemented
//
// The OHL uses HockeyTech for stats. This connector fetches from the
// HockeyTech JSON feed directly (not HTML scraping).
//
// The OHL is a top CHL league producing many NHL draft picks annually.
// This implementation serves as the reference for all HockeyTech leagues
// (AHL, ECHL, WHL, QMJHL, USHL, NAHL, BCHL).
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
  splitName,
  normalizePosition,
  normalizeNationality,
  safeInt,
  safeFloat,
  parseHeight,
  parseWeight,
  calculateAge,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
  createEmptyGoalieStats,
} from '../../core/normalization';
import {
  buildHtUrl,
  parseHtResponse,
  htRowsToRecords,
  HOCKEYTECH_BASE,
  HOCKEYTECH_KEYS,
} from './hockeytech-common';
import { registry } from '../registry';

const LEAGUE = 'ohl';
const SEASON = '2025-2026';

export class OhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'ohl',
    sourceType: 'hybrid',
    sourceUrl: 'https://ontariohockeyleague.com/stats',
    league: LEAGUE,
    ingestionCadence: 'daily',
    maturity: 'implemented',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key may change (verify at ontariohockeyleague.com)',
      'JSON feed is undocumented / unofficial',
      'Season format is concatenated (20252026)',
      'Player IDs are HockeyTech-specific, not universal',
      'Birthdate format varies; some records missing DOB',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
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

  constructor(season = SEASON) {
    super();
    this.season = season;
  }

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    // Fetch skater stats
    const skaterUrl = buildHtUrl({ league: LEAGUE, season: this.season, view: 'players', sort: 'points' });
    const skaterResult = await this.fetchUrl(skaterUrl, {
      headers: { 'Accept': 'application/json, text/javascript, */*' },
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

    // Fetch goalie stats
    const goalieUrl = buildHtUrl({ league: LEAGUE, season: this.season, view: 'goalies', sort: 'wins' });
    const goalieResult = await this.fetchUrl(goalieUrl, {
      headers: { 'Accept': 'application/json, text/javascript, */*' },
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
      throw new Error('OHL: Failed to fetch any data from HockeyTech feed');
    }

    return results;
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      const data = parseHtResponse(fetchResult.rawBody);
      if (!data) continue;

      const rows = data.SiteKit?.Statviewtype;
      if (!rows || !Array.isArray(rows)) continue;

      // Determine record type from URL
      const isGoalie = fetchResult.url.includes('view=goalies');
      const parsed = htRowsToRecords(rows, LEAGUE, isGoalie ? 'goalie' : 'skater');
      records.push(...parsed);
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

      // Parse name — HockeyTech returns "LastName, FirstName"
      const rawName = f.fullName as string;
      let firstName = f.firstName as string;
      let lastName = f.lastName as string;
      if (rawName.includes(',')) {
        const parts = splitName(rawName);
        firstName = parts.firstName || firstName;
        lastName = parts.lastName || lastName;
      }
      const fullName = `${firstName} ${lastName}`.trim();
      if (!fullName || fullName.length < 2) continue;

      // Build player
      const player = createEmptyPlayer('ohl', LEAGUE);
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizePosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.handedness = normalizeHandedness(f.shootsCatches as string | null);
      player.teamName = (f.teamName as string) || null;
      player.nationality = normalizeNationality(f.nationality as string);

      // Physical — HockeyTech returns height as "5-11" or "6'2"
      player.heightCm = parseHeight(f.height as string);
      player.weightKg = parseWeight(f.weight as string);

      // Birth date
      const rawDob = f.birthDate as string;
      if (rawDob) {
        // HockeyTech dates can be "Jan 15, 2006" or "2006-01-15"
        const parsed = parseBirthDate(rawDob);
        player.dateOfBirth = parsed;
        player.age = calculateAge(parsed);
      }

      // Source ID
      player.sourceIds['ohl'] = f.htPlayerId as string;

      player.snapshotDate = snapshot;

      // Quality
      const missing: string[] = [];
      if (!player.dateOfBirth) missing.push('dateOfBirth');
      if (!player.heightCm) missing.push('heightCm');
      if (!player.weightKg) missing.push('weightKg');
      if (!player.nationality) missing.push('nationality');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);

      // Build stats
      if (record.recordType === 'skater') {
        const stat = createEmptySkaterStats('ohl', LEAGUE, season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.goals = safeInt(f.goals) || 0;
        stat.assists = safeInt(f.assists) || 0;
        stat.points = safeInt(f.points) || stat.goals + stat.assists;
        stat.penaltyMinutes = safeInt(f.penaltyMinutes);
        stat.plusMinus = safeInt(f.plusMinus);
        stat.ppGoals = safeInt(f.ppGoals);
        stat.ppAssists = safeInt(f.ppAssists);
        stat.ppPoints = (stat.ppGoals || 0) + (stat.ppAssists || 0) > 0
          ? (stat.ppGoals || 0) + (stat.ppAssists || 0) : null;
        stat.shGoals = safeInt(f.shGoals);
        stat.shAssists = safeInt(f.shAssists);
        stat.shPoints = (stat.shGoals || 0) + (stat.shAssists || 0) > 0
          ? (stat.shGoals || 0) + (stat.shAssists || 0) : null;
        stat.shots = safeInt(f.shots);
        stat.shootingPct = safeFloat(f.shootingPct);
        stat.gwGoals = safeInt(f.gwGoals);
        stat.pointsPerGame = stat.gamesPlayed > 0
          ? Math.round((stat.points / stat.gamesPlayed) * 100) / 100
          : 0;
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;

        const statMissing: string[] = [];
        if (stat.shots === null) statMissing.push('shots');
        stat.dataQuality = createDefaultQuality(statMissing);

        skaterStats.push(stat);
      } else if (record.recordType === 'goalie') {
        const stat = createEmptyGoalieStats('ohl', LEAGUE, season);
        stat.teamName = player.teamName;
        stat.gamesPlayed = safeInt(f.gamesPlayed) || 0;
        stat.gamesStarted = safeInt(f.gamesStarted);
        stat.wins = safeInt(f.wins) || 0;
        stat.losses = safeInt(f.losses) || 0;
        stat.otl = safeInt(f.otLosses);
        stat.shutouts = safeInt(f.shutouts);
        stat.saves = safeInt(f.saves);
        stat.goalsAgainst = safeInt(f.goalsAgainst);
        stat.goalsAgainstAvg = safeFloat(f.goalsAgainstAvg);
        stat.savePct = safeFloat(f.savePct);
        stat.shotsAgainst = safeInt(f.shotsAgainst);
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
    const url = buildHtUrl({ league: LEAGUE, season: this.season, view: 'players', sort: 'points', limit: 1 });
    const result = await this.fetchUrl(url, {
      headers: { 'Accept': 'application/json, text/javascript, */*' },
      retries: 0,
      timeout: 10000,
    });
    if (!result) return { healthy: false, message: 'HockeyTech feed unreachable' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    const data = parseHtResponse(result.body);
    if (!data?.SiteKit?.Statviewtype) return { healthy: false, message: 'Unexpected response structure' };
    return { healthy: true, message: `OK (${data.SiteKit.Statviewtype.length} rows)` };
  }
}

/** Parse HockeyTech date formats into YYYY-MM-DD */
function parseBirthDate(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;

  // Already ISO format: "2006-01-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // "Jan 15, 2006" or "January 15, 2006"
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch { /* fall through */ }

  return null;
}

function normalizeHandedness(val: string | null | undefined): 'L' | 'R' | null {
  if (!val) return null;
  const c = val.toUpperCase().charAt(0);
  return c === 'L' ? 'L' : c === 'R' ? 'R' : null;
}

registry.register('ohl', () => new OhlConnector());
