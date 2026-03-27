// ============================================================================
// HockeyTech League Connector — Generic Implementation
// ============================================================================
// A reusable, fully-implemented connector for any HockeyTech Leaguestat
// league. OHL was implemented first as a standalone; this generic version
// extracts the shared logic so WHL, QMJHL, AHL, ECHL, USHL, NAHL, and
// BCHL can all be instantiated with just a config object.
//
// Usage:
//   const whl = new HockeyTechConnector({ league: 'whl', ... });
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  FieldCoverage,
  ConnectorTier,
  IngestionCadence,
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
  HOCKEYTECH_KEYS,
} from './hockeytech-common';

export interface HockeyTechLeagueConfig {
  league: string;         // e.g. 'whl'
  label: string;          // e.g. 'WHL (Western Hockey League)'
  sourceUrl: string;      // e.g. 'https://whl.ca/stats'
  season: string;         // e.g. '2025-2026'
  tier: ConnectorTier;
  cadence?: IngestionCadence;
  knownLimitations?: string[];
  fieldCoverageOverrides?: Partial<FieldCoverage>;
}

const DEFAULT_FIELD_COVERAGE: FieldCoverage = {
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
};

export class HockeyTechConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor;
  private league: string;
  private season: string;

  constructor(config: HockeyTechLeagueConfig) {
    super();
    this.league = config.league;
    this.season = config.season;

    if (!HOCKEYTECH_KEYS[config.league]) {
      throw new Error(`No HockeyTech client key for league: ${config.league}`);
    }

    this.descriptor = {
      sourceName: config.league,
      sourceType: 'hybrid',
      sourceUrl: config.sourceUrl,
      league: config.league,
      ingestionCadence: config.cadence || 'daily',
      maturity: 'implemented',
      tier: config.tier,
      knownLimitations: config.knownLimitations || [
        `HockeyTech client key may change (verify at ${config.sourceUrl})`,
        'JSON feed is undocumented / unofficial',
        'Player IDs are HockeyTech-specific, not universal',
        'Birthdate format varies; some records missing DOB',
      ],
      fieldCoverage: {
        ...DEFAULT_FIELD_COVERAGE,
        ...config.fieldCoverageOverrides,
      },
    };
  }

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];
    const headers = { 'Accept': 'application/json, text/javascript, */*' };

    // Fetch skater stats
    const skaterUrl = buildHtUrl({
      league: this.league,
      season: this.season,
      view: 'players',
      sort: 'points',
    });
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

    // Fetch goalie stats
    const goalieUrl = buildHtUrl({
      league: this.league,
      season: this.season,
      view: 'goalies',
      sort: 'wins',
    });
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
      throw new Error(`[${this.league}] Failed to fetch any data from HockeyTech feed`);
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

      const isGoalie = fetchResult.url.includes('view=goalies');
      const parsed = htRowsToRecords(rows, this.league, isGoalie ? 'goalie' : 'skater');
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
      const player = createEmptyPlayer(this.league, this.league);
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizePosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.handedness = normalizeHandedness(f.shootsCatches as string | null);
      player.teamName = (f.teamName as string) || null;
      player.nationality = normalizeNationality(f.nationality as string);

      // Physical
      player.heightCm = parseHeight(f.height as string);
      player.weightKg = parseWeight(f.weight as string);

      // Birth date
      const rawDob = f.birthDate as string;
      if (rawDob) {
        const parsed = parseBirthDate(rawDob);
        player.dateOfBirth = parsed;
        player.age = calculateAge(parsed);
      }

      // Source ID
      player.sourceIds[this.league] = f.htPlayerId as string;

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
        const stat = createEmptySkaterStats(this.league, this.league, season);
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
        const stat = createEmptyGoalieStats(this.league, this.league, season);
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
    const url = buildHtUrl({
      league: this.league,
      season: this.season,
      view: 'players',
      sort: 'points',
      limit: 1,
    });
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

// ── Shared helpers ──

function parseBirthDate(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /* fall through */ }
  return null;
}

function normalizeHandedness(val: string | null | undefined): 'L' | 'R' | null {
  if (!val) return null;
  const c = val.toUpperCase().charAt(0);
  return c === 'L' ? 'L' : c === 'R' ? 'R' : null;
}
