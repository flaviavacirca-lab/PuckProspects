// ============================================================================
// Elite Prospects Scraper Connector
// ============================================================================
// Example connector that demonstrates how to wrap a scraper into the pipeline.
// This bridges the existing EP parser (src/lib/scraper/ep-parser.ts) into the
// new connector interface.
//
// Supports multiple leagues via the EP_LEAGUE_SLUGS mapping.
// One instance per league — create multiple via the factory function.
// ============================================================================

import * as cheerio from 'cheerio';
import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  FieldCoverage,
} from '../../domain/models';
import {
  normalizeName,
  splitName,
  normalizePosition,
  normalizeNationality,
  safeInt,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
} from '../../core/normalization';
import { EP_LEAGUE_SLUGS, getEPStatsUrl } from '@/lib/scraper/ep-leagues';
import { registry } from '../registry';

const FIELD_COVERAGE: FieldCoverage = {
  hasBasicStats: true,
  hasPlusMinus: true,
  hasSpecialTeams: false,
  hasShots: false,
  hasFaceoffs: false,
  hasIceTime: false,
  hasHitsBlocks: false,
  hasGoalieStats: false,
  hasBiographicalData: false, // Needs separate player page scrape
  hasDraftInfo: false,
  hasNhlAffiliation: false,
};

export class EPLeagueConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor;
  private leagueCode: string;
  private season: string;

  constructor(leagueCode: string, season = '2025-2026') {
    super();
    this.leagueCode = leagueCode;
    this.season = season;

    const slug = EP_LEAGUE_SLUGS[leagueCode];
    this.descriptor = {
      sourceName: `ep_${leagueCode}`,
      sourceType: 'scrape',
      sourceUrl: slug ? getEPStatsUrl(slug, season) : '',
      league: leagueCode,
      ingestionCadence: 'daily',
      knownLimitations: [
        'No age/DOB data from stats page (requires player page scrape)',
        'No draft info from stats page',
        'No special teams breakdown',
        'Rate limited — be respectful of EP servers',
        'HTML structure may change without notice',
      ],
      fieldCoverage: FIELD_COVERAGE,
    };
  }

  async fetch(): Promise<FetchResult[]> {
    const slug = EP_LEAGUE_SLUGS[this.leagueCode];
    if (!slug) {
      throw new Error(`No EP slug mapping for league: ${this.leagueCode}`);
    }

    const url = getEPStatsUrl(slug, this.season);
    const result = await this.fetchUrl(url);

    if (!result || result.status !== 200 || !result.body) {
      throw new Error(`Failed to fetch EP stats page: ${url} (status: ${result?.status})`);
    }

    return [{
      rawBody: result.body,
      contentType: 'html',
      httpStatus: result.status,
      url,
      fetchedAt: new Date(),
    }];
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      const $ = cheerio.load(fetchResult.rawBody);

      const table = $('table.table--sortable, table.table, .player-stats table').first();
      if (!table.length) continue;

      const rows = table.find('tbody tr');

      rows.each((_index, row) => {
        try {
          const $row = $(row);
          const cells = $row.find('td');
          if (cells.length < 6) return;

          // Player link and EP ID
          const playerLink = $row.find('a[href*="/player/"]').first();
          const href = playerLink.attr('href') || '';
          const epIdMatch = href.match(/\/player\/(\d+)\//);
          const epId = epIdMatch ? epIdMatch[1] : '';
          const fullName = playerLink.text().trim();
          if (!fullName) return;

          // Position
          const rowText = $row.text();
          const posMatch = rowText.match(/\((C|LW|RW|D|G|F|W)\)/);
          const position = posMatch ? posMatch[1] : null;

          // Team
          const teamLink = $row.find('a[href*="/team/"]').first();
          const teamName = teamLink.text().trim() || null;

          // Nationality from flag
          const flag = $row.find('img[src*="flag"], .flag, i[class*="flag"]').first();
          const nationality = flag.attr('title') || flag.attr('alt') || null;

          // Numeric stats
          const numericCells = cells.filter((_, cell) => {
            const text = $(cell).text().trim();
            return /^-?\d+$/.test(text);
          });
          const stats = numericCells.map((_, cell) => $(cell).text().trim()).get();

          records.push({
            sourcePlayerId: epId || `ep_${this.leagueCode}_${_index}`,
            recordType: position === 'G' ? 'goalie' : 'skater',
            fields: {
              fullName,
              position,
              teamName,
              nationality,
              gp: stats[0],
              goals: stats[1],
              assists: stats[2],
              points: stats[3],
              pim: stats[4],
              plusMinus: stats[5],
              epId,
              sourceUrl: href ? `https://www.eliteprospects.com${href}` : null,
            },
          });
        } catch {
          // Skip problematic rows
        }
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
      const fullName = f.fullName as string;
      const { firstName, lastName } = splitName(fullName);

      // Build player
      const player = createEmptyPlayer(`ep_${this.leagueCode}`, this.leagueCode);
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizePosition(f.position as string | null);
      player.positionGroup = this.getPositionGroup(player.position);
      player.nationality = normalizeNationality(f.nationality as string | null);
      player.teamName = f.teamName as string | null;
      player.sourceUrl = f.sourceUrl as string | null;
      player.snapshotDate = snapshot;

      if (f.epId) {
        player.sourceIds[`ep_${this.leagueCode}`] = f.epId as string;
        player.sourceIds['elite_prospects'] = f.epId as string;
      }

      // Track missing fields for quality
      const missing: string[] = [];
      if (!player.dateOfBirth) missing.push('dateOfBirth');
      if (!player.age) missing.push('age');
      if (!player.heightCm) missing.push('heightCm');
      if (!player.weightKg) missing.push('weightKg');
      if (!player.handedness) missing.push('handedness');
      if (!player.draftStatus) missing.push('draftStatus');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);

      // Build stats
      if (record.recordType === 'skater') {
        const stat = createEmptySkaterStats(`ep_${this.leagueCode}`, this.leagueCode, season);
        stat.teamName = f.teamName as string | null;
        stat.gamesPlayed = safeInt(f.gp) || 0;
        stat.goals = safeInt(f.goals) || 0;
        stat.assists = safeInt(f.assists) || 0;
        stat.points = safeInt(f.points) || stat.goals + stat.assists;
        stat.penaltyMinutes = safeInt(f.pim);
        stat.plusMinus = safeInt(f.plusMinus);
        stat.pointsPerGame = stat.gamesPlayed > 0
          ? Math.round((stat.points / stat.gamesPlayed) * 100) / 100
          : 0;
        stat.sourceUrl = f.sourceUrl as string | null;
        stat.snapshotDate = snapshot;
        stat.rawPayload = f as Record<string, unknown>;

        const statMissing: string[] = [];
        if (stat.plusMinus === null) statMissing.push('plusMinus');
        stat.dataQuality = createDefaultQuality(statMissing);

        skaterStats.push(stat);
      }
    }

    return { players, skaterStats, goalieStats };
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const slug = EP_LEAGUE_SLUGS[this.leagueCode];
    if (!slug) {
      return { healthy: false, message: `No EP slug for league: ${this.leagueCode}` };
    }

    const url = getEPStatsUrl(slug, this.season);
    const result = await this.fetchUrl(url, { retries: 0, timeout: 10000 });

    if (!result) {
      return { healthy: false, message: 'Failed to connect to Elite Prospects' };
    }
    if (result.status !== 200) {
      return { healthy: false, message: `HTTP ${result.status}` };
    }
    return { healthy: true, message: 'OK' };
  }
}

// ============================================================================
// Factory + Registration
// ============================================================================
// Creates one connector per league that has an EP slug mapping.
// Uncomment the registration block below to activate these connectors.

export function createEPConnector(leagueCode: string, season?: string): EPLeagueConnector {
  return new EPLeagueConnector(leagueCode, season);
}

// --- Auto-register all EP league connectors ---
// Uncomment when ready to activate:
//
// for (const leagueCode of Object.keys(EP_LEAGUE_SLUGS)) {
//   registry.register(`ep_${leagueCode}`, () => createEPConnector(leagueCode));
// }
