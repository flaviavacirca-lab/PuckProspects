// ============================================================================
// HockeyDB Enrichment Connector — IMPLEMENTED
// ============================================================================
// Source: https://www.hockeydb.com/
// Type: enrichment (scrape HTML)
// Maturity: implemented
//
// HockeyDB is a comprehensive hockey encyclopedia used for enrichment:
// - Player biographical data (DOB, birthplace, height, weight)
// - Draft information
// - NHL affiliation / rights holder
// - Career transaction history
//
// This is NOT a primary stats source. It enriches players already in our DB
// by filling in missing bio/draft fields.
//
// URL patterns:
//   Search: https://www.hockeydb.com/ihdb/stats/findplayer.php?full_name=First+Last
//   Player: https://www.hockeydb.com/ihdb/stats/pdisplay.php?pid=XXXXX
//
// Rate limiting: This is a community resource. We use conservative delays
// between requests (500ms minimum) to avoid being blocked.
// ============================================================================

import * as cheerio from 'cheerio';
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
  parseHeight,
  parseWeight,
  calculateAge,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
} from '../../core/normalization';
import { registry } from '../registry';

const HOCKEYDB_BASE = 'https://www.hockeydb.com';

/**
 * HockeyDB enrichment works differently from primary connectors:
 * Instead of fetching a full stats page, it takes a list of player names
 * to look up and enriches them with bio/draft data.
 *
 * When run standalone (via the pipeline), it fetches a "recent players"
 * page to demonstrate the pattern. In production, it would be called
 * with specific player names to enrich.
 */
export class HockeyDbConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'hockeydb',
    sourceType: 'enrichment',
    sourceUrl: HOCKEYDB_BASE,
    league: '*',
    ingestionCadence: 'weekly',
    maturity: 'implemented',
    tier: 3,
    leaguesCovered: ['ahl', 'ohl', 'whl', 'qmjhl', 'ncaa', 'ushl', 'shl', 'liiga', 'khl'],
    knownLimitations: [
      'Enrichment only — not a primary stats source',
      'HTML scraping required (traditional tables)',
      'Rate limit: 500ms between requests (community resource)',
      'Player search may return multiple matches',
      'Historical data strong, current season may lag',
      'Some prospect pages may be minimal',
    ],
    fieldCoverage: {
      hasBasicStats: false,
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

  /** Player names to look up (set externally for enrichment runs) */
  private searchNames: string[] = [];

  /** Set player names to enrich */
  setSearchNames(names: string[]): void {
    this.searchNames = names;
  }

  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    // If specific names were provided, search for each
    if (this.searchNames.length > 0) {
      for (const name of this.searchNames) {
        const encoded = encodeURIComponent(name);
        const url = `${HOCKEYDB_BASE}/ihdb/stats/findplayer.php?full_name=${encoded}`;

        const result = await this.fetchUrl(url, { retries: 1, timeout: 15000 });
        if (result && result.status === 200 && result.body) {
          results.push({
            rawBody: result.body,
            contentType: 'html',
            httpStatus: result.status,
            url,
            fetchedAt: new Date(),
          });
        }

        // Respectful delay between requests
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // If no specific names, do a demonstration fetch:
    // Fetch the "NHL Draft Picks" page for the most recent draft year
    // which gives us a list of players with draft info
    if (this.searchNames.length === 0) {
      const draftUrl = `${HOCKEYDB_BASE}/ihdb/draft/nhl2025e.html`;
      const result = await this.fetchUrl(draftUrl, { retries: 2, timeout: 20000 });

      if (result && result.status === 200 && result.body) {
        results.push({
          rawBody: result.body,
          contentType: 'html',
          httpStatus: result.status,
          url: draftUrl,
          fetchedAt: new Date(),
        });
      }

      // Fallback to a different page if draft page not available
      if (results.length === 0) {
        const fallbackUrl = `${HOCKEYDB_BASE}/ihdb/draft/nhl2024e.html`;
        const fallbackResult = await this.fetchUrl(fallbackUrl, { retries: 1, timeout: 15000 });
        if (fallbackResult && fallbackResult.status === 200 && fallbackResult.body) {
          results.push({
            rawBody: fallbackResult.body,
            contentType: 'html',
            httpStatus: fallbackResult.status,
            url: fallbackUrl,
            fetchedAt: new Date(),
          });
        }
      }
    }

    if (results.length === 0) {
      throw new Error('HockeyDB: No pages fetched');
    }

    return results;
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      const url = fetchResult.url;

      if (url.includes('findplayer.php')) {
        records.push(...this.parseSearchResults(fetchResult));
      } else if (url.includes('/draft/') || url.includes('nhl20')) {
        records.push(...this.parseDraftPage(fetchResult));
      } else if (url.includes('pdisplay.php')) {
        records.push(...this.parsePlayerPage(fetchResult));
      }
    }

    return records;
  }

  /** Parse a search results page */
  private parseSearchResults(fetchResult: FetchResult): ParsedRecord[] {
    const records: ParsedRecord[] = [];
    const $ = cheerio.load(fetchResult.rawBody);

    // If the page redirected directly to a player page, parse it as such
    if ($('.bTitle').length > 0 || $('table.data').length > 0) {
      return this.parsePlayerPageFromDom($, fetchResult.url);
    }

    // Parse search results table
    const resultRows = $('table tr').filter((_i, el) => {
      return $(el).find('a[href*="pdisplay.php"]').length > 0;
    });

    resultRows.each((_i, row) => {
      const $row = $(row);
      const link = $row.find('a[href*="pdisplay.php"]').first();
      const href = link.attr('href') || '';
      const name = link.text().trim();
      const pidMatch = href.match(/pid=(\d+)/);
      const pid = pidMatch ? pidMatch[1] : '';

      if (!name || !pid) return;

      // Extract whatever info is available in the search result row
      const cells = $row.find('td').map((_j, td) => $(td).text().trim()).get();

      records.push({
        sourcePlayerId: pid,
        recordType: 'bio',
        fields: {
          fullName: name,
          hdbPid: pid,
          playerUrl: href.startsWith('http') ? href : `${HOCKEYDB_BASE}${href}`,
          position: cells[1] || null, // Position is often 2nd column
          rawCells: cells,
        },
      });
    });

    return records;
  }

  /** Parse a draft page (lists draft picks with bio data) */
  private parseDraftPage(fetchResult: FetchResult): ParsedRecord[] {
    const records: ParsedRecord[] = [];
    const $ = cheerio.load(fetchResult.rawBody);

    // Draft pages have tables with: Round, Pick, Name, Team, League, etc.
    $('table tr').each((_i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      if (cells.length < 5) return;

      const playerLink = $row.find('a[href*="pdisplay.php"], a[href*="/ihdb/stats/"]').first();
      const name = playerLink.text().trim();
      if (!name) return;

      const href = playerLink.attr('href') || '';
      const pidMatch = href.match(/pid=(\d+)/);
      const pid = pidMatch ? pidMatch[1] : `hdb_draft_${_i}`;

      // Extract cell text
      const cellText = cells.map((_j, td) => $(td).text().trim()).get();

      // Common draft page columns: Rd, #, Player, Pos, Team, League, DOB/Age
      const round = parseInt(cellText[0], 10) || null;
      const pick = parseInt(cellText[1], 10) || null;
      const position = cellText[3] || null;
      const nhlTeam = cellText[4] || null;
      const league = cellText[5] || null;

      records.push({
        sourcePlayerId: pid,
        recordType: 'bio',
        fields: {
          fullName: name,
          hdbPid: pid,
          playerUrl: href.startsWith('http') ? href : `${HOCKEYDB_BASE}${href}`,
          draftRound: round,
          draftPick: pick,
          draftOverall: pick, // For first-round picks, pick === overall; we refine later
          position,
          draftedByTeam: nhlTeam,
          currentLeague: league,
          rawCells: cellText,
        },
      });
    });

    return records;
  }

  /** Parse a player detail page */
  private parsePlayerPage(fetchResult: FetchResult): ParsedRecord[] {
    const $ = cheerio.load(fetchResult.rawBody);
    return this.parsePlayerPageFromDom($, fetchResult.url);
  }

  /** Extract player bio data from a HockeyDB player page DOM */
  private parsePlayerPageFromDom($: cheerio.CheerioAPI, url: string): ParsedRecord[] {
    const records: ParsedRecord[] = [];

    // Player name from title or heading
    const titleText = $('h1, .bTitle, title').first().text().trim();
    const nameMatch = titleText.match(/^([A-Za-z\s.\-']+)/);
    const fullName = nameMatch ? nameMatch[1].trim() : '';
    if (!fullName) return records;

    // Try to find the PID from URL
    const pidMatch = url.match(/pid=(\d+)/);
    const pid = pidMatch ? pidMatch[1] : '';

    // Bio table — HockeyDB has a bio info section
    const bioText = $('body').text();

    // Extract bio fields using regex patterns on the page text
    const dobMatch = bioText.match(/Born\s+(\w+\s+\d{1,2},\s+\d{4})/i)
      || bioText.match(/(\d{4}-\d{2}-\d{2})/);
    const dob = dobMatch ? dobMatch[1] : null;

    const birthPlaceMatch = bioText.match(/in\s+([A-Za-z\s,]+?)(?:\s*\.\s*|\s*Height)/i);
    const birthPlace = birthPlaceMatch ? birthPlaceMatch[1].trim() : null;

    const heightMatch = bioText.match(/Height\s+([\d'-]+)/i);
    const height = heightMatch ? heightMatch[1] : null;

    const weightMatch = bioText.match(/Weight\s+(\d+)/i);
    const weight = weightMatch ? `${weightMatch[1]} lbs` : null;

    const posMatch = bioText.match(/Position\s+(\w+)/i);
    const position = posMatch ? posMatch[1] : null;

    const shootsMatch = bioText.match(/Shoots\s+(\w+)/i) || bioText.match(/Catches\s+(\w+)/i);
    const shoots = shootsMatch ? shootsMatch[1].charAt(0).toUpperCase() : null;

    // Draft info
    const draftMatch = bioText.match(/Drafted by\s+(.+?)\s+.*?(\d{4})\s+NHL Entry Draft/i)
      || bioText.match(/(\d{4})\s+NHL.*?Draft.*?Round\s+(\d+).*?Pick\s+(\d+)/i);

    let draftedBy: string | null = null;
    let draftYear: number | null = null;
    let draftRound: number | null = null;
    let draftPick: number | null = null;

    if (draftMatch) {
      draftedBy = draftMatch[1] || null;
      draftYear = parseInt(draftMatch[2], 10) || null;
      if (draftMatch[3]) draftRound = parseInt(draftMatch[3], 10);
    }

    records.push({
      sourcePlayerId: pid || `hdb_${normalizeName(fullName).replace(/\s/g, '_')}`,
      recordType: 'bio',
      fields: {
        fullName,
        hdbPid: pid,
        playerUrl: url,
        dateOfBirth: dob,
        birthPlace,
        height,
        weight,
        position,
        shootsCatches: shoots,
        draftedBy,
        draftYear,
        draftRound,
        draftPick,
      },
    });

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
      const fullName = f.fullName as string;
      if (!fullName || fullName.length < 2) continue;

      const { firstName, lastName } = splitName(fullName);

      const player = createEmptyPlayer('hockeydb', '*');
      player.firstName = firstName;
      player.lastName = lastName;
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.position = normalizePosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.handedness = normalizeHandedness(f.shootsCatches as string | null);

      // Physical
      player.heightCm = parseHeight(f.height as string);
      player.weightKg = parseWeight(f.weight as string);

      // Birth info
      if (f.dateOfBirth) {
        const dob = parseDateString(f.dateOfBirth as string);
        player.dateOfBirth = dob;
        player.age = calculateAge(dob);
      }

      if (f.birthPlace) {
        const place = f.birthPlace as string;
        // Birth place often like "Toronto, ON, Canada" or "Stockholm, Sweden"
        const parts = place.split(',').map(s => s.trim());
        player.birthCity = parts[0] || null;
        player.birthCountry = normalizeNationality(parts[parts.length - 1]) || null;
        player.nationality = player.birthCountry;
      }

      // Draft info
      if (f.draftYear) {
        player.draftYear = f.draftYear as number;
        player.draftStatus = 'drafted';
      }
      if (f.draftRound) player.draftRound = f.draftRound as number;
      if (f.draftPick) player.draftPick = f.draftPick as number;
      if (f.draftOverall) player.draftOverall = f.draftOverall as number;
      if (f.draftedBy || f.draftedByTeam) {
        player.draftedBy = (f.draftedBy || f.draftedByTeam) as string;
        player.nhlRightsHolder = player.draftedBy;
      }

      // Source IDs
      if (f.hdbPid) {
        player.sourceIds['hockeydb'] = f.hdbPid as string;
      }
      player.sourceUrl = (f.playerUrl as string) || null;
      player.snapshotDate = snapshot;

      // Quality
      const missing: string[] = [];
      if (!player.dateOfBirth) missing.push('dateOfBirth');
      if (!player.heightCm) missing.push('heightCm');
      if (!player.weightKg) missing.push('weightKg');
      if (!player.nationality) missing.push('nationality');
      if (!player.position) missing.push('position');
      player.dataQuality = createDefaultQuality(missing);

      players.push(player);
    }

    // Enrichment connector: bio data only, no stats
    return { players, skaterStats: [], goalieStats: [] };
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const result = await this.fetchUrl(`${HOCKEYDB_BASE}/ihdb/stats/findplayer.php?full_name=Connor+McDavid`, {
      retries: 0,
      timeout: 10000,
    });
    if (!result) return { healthy: false, message: 'HockeyDB unreachable' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    if (result.body.includes('McDavid')) return { healthy: true, message: 'OK' };
    return { healthy: false, message: 'Unexpected response' };
  }
}

/** Parse various date string formats into YYYY-MM-DD */
function parseDateString(raw: string): string | null {
  if (!raw) return null;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // "January 13, 1997" or "Jan 13, 1997"
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

registry.register('hockeydb', () => new HockeyDbConnector());
