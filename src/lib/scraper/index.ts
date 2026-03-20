import { PlayerSearchResult } from '@/types';
import { cache, CACHE_TTL } from './cache';
import { EP_LEAGUE_SLUGS, getEPStatsUrl } from './ep-leagues';
import { parseLeagueStatsPage } from './ep-parser';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import { LEAGUES } from '@/lib/leagues';

const CURRENT_SEASON = '2025-2026';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetch a URL with automatic retry and back-off for transient errors.
 */
async function fetchWithRetry(url: string, retries = 2): Promise<string | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (res.ok) return await res.text();
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return null; // 403, 404, etc.
    } catch {
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  return null;
}

/**
 * Scrape a single league's stats page from Elite Prospects.
 * Results are cached in-memory for CACHE_TTL milliseconds.
 */
async function scrapeLeague(
  leagueCode: string,
): Promise<PlayerSearchResult[]> {
  const slug = EP_LEAGUE_SLUGS[leagueCode];
  if (!slug) return [];

  const cacheKey = `league:${leagueCode}`;
  const cached = cache.get<PlayerSearchResult[]>(cacheKey);
  if (cached) return cached;

  const league = LEAGUES.find((l) => l.code === leagueCode);
  const leagueName = league?.name || leagueCode.toUpperCase();

  const url = getEPStatsUrl(slug, CURRENT_SEASON);
  const html = await fetchWithRetry(url);
  if (!html) return [];

  const players = parseLeagueStatsPage(html, leagueCode, leagueName, '2025-26');
  if (players.length > 0) {
    cache.set(cacheKey, players, CACHE_TTL);
  }
  return players;
}

/**
 * Fetch all players across every configured league.
 * Scrapes Elite Prospects in batches of 3 to avoid overwhelming the server.
 * Falls back to mock data when scraping yields no results.
 */
export async function getAllPlayers(): Promise<PlayerSearchResult[]> {
  const cacheKey = 'all-players';
  const cached = cache.get<PlayerSearchResult[]>(cacheKey);
  if (cached) return cached;

  const leagueCodes = Object.keys(EP_LEAGUE_SLUGS);

  // Scrape leagues in batches of 3 to avoid overwhelming EP
  const allPlayers: PlayerSearchResult[] = [];
  const batchSize = 3;

  for (let i = 0; i < leagueCodes.length; i += batchSize) {
    const batch = leagueCodes.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((code) => scrapeLeague(code)),
    );
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPlayers.push(...result.value);
      }
    }
    // Small delay between batches
    if (i + batchSize < leagueCodes.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (allPlayers.length > 0) {
    // Recalculate global percentiles
    recalculateGlobalPercentiles(allPlayers);
    cache.set(cacheKey, allPlayers, CACHE_TTL);
    return allPlayers;
  }

  // Fallback to mock data if scraping failed entirely
  console.warn('[PuckProspects] EP scraping failed, falling back to mock data');
  return ALL_MOCK_PLAYERS;
}

/**
 * Recalculate league-wide and age-group percentiles across all players.
 */
function recalculateGlobalPercentiles(players: PlayerSearchResult[]): void {
  const sorted = [...players].sort(
    (a, b) => a.pointsPerGame - b.pointsPerGame,
  );
  const n = sorted.length;
  sorted.forEach((player, index) => {
    player.leaguePercentile = Math.round((index / (n - 1 || 1)) * 100);
  });

  // Age percentiles - compare within same age group
  const byAge = new Map<number, PlayerSearchResult[]>();
  for (const p of players) {
    const group = byAge.get(p.age) || [];
    group.push(p);
    byAge.set(p.age, group);
  }
  byAge.forEach((group) => {
    const ageSorted = group.sort(
      (a: PlayerSearchResult, b: PlayerSearchResult) =>
        a.pointsPerGame - b.pointsPerGame,
    );
    ageSorted.forEach((player: PlayerSearchResult, index: number) => {
      player.agePercentile = Math.round(
        (index / (ageSorted.length - 1 || 1)) * 100,
      );
    });
  });
}

/**
 * Look up a single player by numeric ID from the full player list.
 */
export async function getPlayerById(
  id: number,
): Promise<PlayerSearchResult | null> {
  const all = await getAllPlayers();
  return all.find((p) => p.id === id) || null;
}
