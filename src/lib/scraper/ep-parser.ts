import * as cheerio from 'cheerio';
import { PlayerSearchResult, DraftStatus, Position } from '@/types';

interface RawPlayerRow {
  epId: string;
  name: string;
  position: string;
  team: string;
  nationality: string;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
}

/**
 * Parse an Elite Prospects league stats HTML page and return structured player data.
 *
 * EP stats tables typically have columns: #, Player, Team, GP, G, A, TP, PIM, +/-
 * Player names link to `/player/{id}/{slug}`, teams link to `/team/{id}/{slug}`,
 * and nationality is indicated by a flag image or icon element.
 */
export function parseLeagueStatsPage(
  html: string,
  leagueCode: string,
  leagueName: string,
  season: string,
): PlayerSearchResult[] {
  const $ = cheerio.load(html);
  const players: PlayerSearchResult[] = [];

  // EP stats tables - try multiple selectors since EP changes their markup
  const table = $('table.table--sortable, table.table, .player-stats table').first();
  if (!table.length) return [];

  const rows = table.find('tbody tr');

  rows.each((index, row) => {
    try {
      const $row = $(row);
      const cells = $row.find('td');
      if (cells.length < 6) return;

      // Player name and EP ID from link
      const playerLink = $row.find('a[href*="/player/"]').first();
      const href = playerLink.attr('href') || '';
      const epIdMatch = href.match(/\/player\/(\d+)\//);
      const epId = epIdMatch ? epIdMatch[1] : '';
      const fullName = playerLink.text().trim();
      if (!fullName) return;

      // Position - often in parentheses after name or in a dedicated cell
      // Try finding text like "(C)", "(LW)", "(RW)", "(D)", "(G)" near the name
      const rowText = $row.text();
      const posMatch = rowText.match(/\((C|LW|RW|D|G|F|W)\)/);
      const position = posMatch ? normalizePosition(posMatch[1]) : 'C';

      // Team
      const teamLink = $row.find('a[href*="/team/"]').first();
      const teamName = teamLink.text().trim() || 'Unknown';

      // Nationality from flag
      const flag = $row.find('img[src*="flag"], .flag, i[class*="flag"]').first();
      const nationality = extractNationality($, flag) || 'Unknown';

      // Stats - typically: GP, G, A, TP, PIM, +/-
      // Find numeric cells
      const numericCells = cells.filter((_, cell) => {
        const text = $(cell).text().trim();
        return /^-?\d+$/.test(text);
      });

      // Parse stats from the numeric cells
      const stats = numericCells
        .map((_, cell) => parseInt($(cell).text().trim(), 10) || 0)
        .get();

      const gp = stats[0] || 0;
      const goals = stats[1] || 0;
      const assists = stats[2] || 0;
      const points = stats[3] || goals + assists;
      const pim = stats[4] || 0;
      const plusMinus = stats[5] || 0;

      if (gp === 0 && goals === 0 && assists === 0) return; // Skip empty rows

      const ppg = gp > 0 ? points / gp : 0;

      players.push({
        id: parseInt(epId) || index + 1000,
        fullName,
        position: position as Position,
        age: 0, // Will be enriched later or from player page
        nationality,
        teamName,
        leagueCode,
        leagueName,
        season,
        gamesPlayed: gp,
        goals,
        assists,
        points,
        pointsPerGame: parseFloat(ppg.toFixed(2)),
        plusMinus,
        draftStatus: 'undrafted' as DraftStatus,
        nhlRightsHolder: null,
        leaguePercentile: 0,
        agePercentile: 0,
      });
    } catch {
      // Skip problematic rows
    }
  });

  // Calculate percentiles within this league
  calculatePercentiles(players);

  return players;
}

function normalizePosition(pos: string): string {
  const map: Record<string, string> = { F: 'C', W: 'RW' };
  return map[pos] || pos;
}

function extractNationality(
  $: cheerio.CheerioAPI,
  flag: cheerio.Cheerio<any>,
): string {
  if (!flag.length) return '';
  // Try various attributes EP uses for nationality
  const title = flag.attr('title') || '';
  if (title) return title;
  const alt = flag.attr('alt') || '';
  if (alt) return alt;
  const className = flag.attr('class') || '';
  const countryMatch = className.match(/flag-(\w+)/);
  if (countryMatch) return countryMatch[1].toUpperCase();
  return '';
}

function calculatePercentiles(players: PlayerSearchResult[]): void {
  if (players.length === 0) return;
  const sorted = [...players].sort((a, b) => a.pointsPerGame - b.pointsPerGame);
  sorted.forEach((player, index) => {
    const percentile = Math.round((index / (sorted.length - 1 || 1)) * 100);
    player.leaguePercentile = percentile;
    player.agePercentile = percentile; // crude; ideally compare within age group
  });
}
