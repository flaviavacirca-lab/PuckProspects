// ============================================================================
// Source Configuration
// ============================================================================
// Defines all data sources, their connector types, and ingestion settings.
// This is the single place to enable/disable sources and configure behavior.
//
// All sources default to enabled: false until their connector is implemented.
// Set enabled: true to include a source in scheduled ingestion runs.
// ============================================================================

import { SourceType, IngestionCadence, ConnectorMaturity, ConnectorTier } from '../domain/models';

export interface SourceConfig {
  /** Unique source identifier (matches connector sourceName) */
  name: string;
  /** Display label */
  label: string;
  /** Source type */
  type: SourceType;
  /** Primary league this source covers (or '*' for multi-league) */
  league: string;
  /** Base URL for the source */
  url: string;
  /** Whether this source is currently enabled for ingestion */
  enabled: boolean;
  /** How often to ingest */
  cadence: IngestionCadence;
  /** Priority (lower = run first) */
  priority: number;
  /** Connector tier */
  tier: ConnectorTier;
  /** Current maturity level */
  maturity: ConnectorMaturity;
  /** API key env var name (if applicable) */
  apiKeyEnv?: string;
  /** Rate limit: max requests per minute */
  rateLimit?: number;
  /** Custom config passed to the connector */
  config?: Record<string, unknown>;
}

export const SOURCES: SourceConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // TIER 1 — API Connectors
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'nhl_api',
    label: 'NHL Unofficial API',
    type: 'api',
    league: '*',
    url: 'https://api-web.nhle.com',
    enabled: false,
    cadence: 'daily',
    priority: 10,
    tier: 1,
    maturity: 'scaffolded',
    rateLimit: 30,
  },
  {
    name: 'balldontlie',
    label: 'BallDontLie NHL API',
    type: 'api',
    league: '*',
    url: 'https://nhl.balldontlie.io',
    enabled: false,
    cadence: 'daily',
    priority: 11,
    tier: 1,
    maturity: 'scaffolded',
    apiKeyEnv: 'BALLDONTLIE_API_KEY',
    rateLimit: 60,
  },
  {
    name: 'api_hockey',
    label: 'API-Hockey (API-Sports)',
    type: 'api',
    league: '*',
    url: 'https://v1.hockey.api-sports.io',
    enabled: false,
    cadence: 'daily',
    priority: 12,
    tier: 1,
    maturity: 'scaffolded',
    apiKeyEnv: 'API_HOCKEY_KEY',
    rateLimit: 10, // Free tier is 100/day
  },
  {
    name: 'thesportsdb',
    label: 'TheSportsDB',
    type: 'hybrid',
    league: '*',
    url: 'https://www.thesportsdb.com/api/v1/json/',
    enabled: false,
    cadence: 'weekly',
    priority: 50,
    tier: 1,
    maturity: 'scaffolded',
    apiKeyEnv: 'THESPORTSDB_API_KEY',
    rateLimit: 60,
  },
  {
    name: 'morehockeystats',
    label: 'MoreHockeyStats',
    type: 'api',
    league: '*',
    url: 'https://morehockeystats.com/data/api',
    enabled: false,
    cadence: 'daily',
    priority: 13,
    tier: 1,
    maturity: 'scaffolded',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 2 — Core Scraping: North America
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'ahl',
    label: 'AHL (HockeyTech)',
    type: 'hybrid',
    league: 'ahl',
    url: 'https://theahl.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 20,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'echl',
    label: 'ECHL (HockeyTech)',
    type: 'hybrid',
    league: 'echl',
    url: 'https://echl.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 25,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'ohl',
    label: 'OHL (HockeyTech)',
    type: 'hybrid',
    league: 'ohl',
    url: 'https://ontariohockeyleague.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 20,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'whl',
    label: 'WHL (HockeyTech)',
    type: 'hybrid',
    league: 'whl',
    url: 'https://whl.ca/stats',
    enabled: false,
    cadence: 'daily',
    priority: 20,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'qmjhl',
    label: 'QMJHL (HockeyTech)',
    type: 'hybrid',
    league: 'qmjhl',
    url: 'https://theqmjhl.ca/stats',
    enabled: false,
    cadence: 'daily',
    priority: 20,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'ncaa',
    label: 'NCAA D1 Hockey',
    type: 'scrape',
    league: 'ncaa',
    url: 'https://www.ncaa.com/stats/icehockey-men/d1',
    enabled: false,
    cadence: 'daily',
    priority: 21,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'ushl',
    label: 'USHL (HockeyTech)',
    type: 'hybrid',
    league: 'ushl',
    url: 'https://ushl.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 21,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },
  {
    name: 'nahl',
    label: 'NAHL (HockeyTech)',
    type: 'hybrid',
    league: 'nahl',
    url: 'https://nahl.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 26,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 2 — Core Scraping: Europe
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'shl',
    label: 'SHL (Swedish Hockey League)',
    type: 'hybrid',
    league: 'shl',
    url: 'https://www.shl.se/statistik',
    enabled: false,
    cadence: 'daily',
    priority: 22,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'j20',
    label: 'J20 Nationell',
    type: 'scrape',
    league: 'j20',
    url: 'https://stats.swehockey.se/',
    enabled: false,
    cadence: 'daily',
    priority: 27,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'liiga',
    label: 'Liiga (Finnish Elite League)',
    type: 'hybrid',
    league: 'liiga',
    url: 'https://liiga.fi/en/statistics',
    enabled: false,
    cadence: 'daily',
    priority: 22,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'khl',
    label: 'KHL',
    type: 'scrape',
    league: 'khl',
    url: 'https://en.khl.ru/stat/',
    enabled: false,
    cadence: 'daily',
    priority: 23,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'mhl',
    label: 'MHL (Russian Junior)',
    type: 'scrape',
    league: 'mhl',
    url: 'https://mhl.khl.ru/stat/',
    enabled: false,
    cadence: 'daily',
    priority: 28,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'swiss_nl',
    label: 'Swiss National League',
    type: 'hybrid',
    league: 'nl',
    url: 'https://www.sihf.ch/en/game-center/national-league/#/statistics',
    enabled: false,
    cadence: 'daily',
    priority: 24,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'del',
    label: 'DEL (Deutsche Eishockey Liga)',
    type: 'scrape',
    league: 'del',
    url: 'https://www.penny-del.org/statistik',
    enabled: false,
    cadence: 'daily',
    priority: 24,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'czech_extraliga',
    label: 'Czech Extraliga',
    type: 'scrape',
    league: 'elh',
    url: 'https://www.hokej.cz/statistiky',
    enabled: false,
    cadence: 'daily',
    priority: 24,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 2 — Development Programs
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'usntdp',
    label: 'US NTDP',
    type: 'scrape',
    league: 'usntdp',
    url: 'https://www.usahockeyntdp.com/stats',
    enabled: false,
    cadence: 'daily',
    priority: 22,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 10,
  },
  {
    name: 'hockey_canada',
    label: 'Hockey Canada Programs',
    type: 'enrichment',
    league: 'hockey_canada',
    url: 'https://www.hockeycanada.ca/en-ca',
    enabled: false,
    cadence: 'weekly',
    priority: 50,
    tier: 2,
    maturity: 'future',
  },
  {
    name: 'bchl',
    label: 'BCHL',
    type: 'hybrid',
    league: 'bchl',
    url: 'https://bchl.ca/stats',
    enabled: false,
    cadence: 'daily',
    priority: 26,
    tier: 2,
    maturity: 'scaffolded',
    rateLimit: 20,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 2 — Elite Prospects (multi-league scraper)
  // ═══════════════════════════════════════════════════════════════════════
  // EP connectors are auto-registered per league (ep_ohl, ep_whl, etc.)
  // They are registered in ep-connector.ts, not listed individually here.
  // To enable EP scraping, the connectors are always available —
  // run them via `--source ep_ohl` etc.

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 3 — Enrichment Sources
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'hockeydb',
    label: 'HockeyDB',
    type: 'enrichment',
    league: '*',
    url: 'https://www.hockeydb.com/',
    enabled: false,
    cadence: 'weekly',
    priority: 100,
    tier: 3,
    maturity: 'scaffolded',
    rateLimit: 5, // Community resource — be very conservative
  },
  {
    name: 'naturalstattrick',
    label: 'Natural Stat Trick',
    type: 'enrichment',
    league: '*',
    url: 'https://www.naturalstattrick.com/',
    enabled: false,
    cadence: 'weekly',
    priority: 101,
    tier: 3,
    maturity: 'future',
    rateLimit: 5,
  },
  {
    name: 'moneypuck',
    label: 'MoneyPuck',
    type: 'enrichment',
    league: '*',
    url: 'https://moneypuck.com/',
    enabled: false,
    cadence: 'weekly',
    priority: 102,
    tier: 3,
    maturity: 'future',
    rateLimit: 5,
  },
];

// ============================================================================
// Helper functions
// ============================================================================

/** Get all enabled sources, sorted by priority */
export function getEnabledSources(): SourceConfig[] {
  return SOURCES.filter(s => s.enabled).sort((a, b) => a.priority - b.priority);
}

/** Get enabled sources for a specific league */
export function getSourcesForLeague(leagueCode: string): SourceConfig[] {
  return getEnabledSources().filter(s => s.league === leagueCode || s.league === '*');
}

/** Get a source config by name */
export function getSource(name: string): SourceConfig | undefined {
  return SOURCES.find(s => s.name === name);
}

/** Check if a source is enabled */
export function isSourceEnabled(name: string): boolean {
  return SOURCES.find(s => s.name === name)?.enabled ?? false;
}

/** Get all sources grouped by tier */
export function getSourcesByTier(): Record<number, SourceConfig[]> {
  return SOURCES.reduce((acc, s) => {
    if (!acc[s.tier]) acc[s.tier] = [];
    acc[s.tier].push(s);
    return acc;
  }, {} as Record<number, SourceConfig[]>);
}

/** Get all sources grouped by maturity */
export function getSourcesByMaturity(): Record<string, SourceConfig[]> {
  return SOURCES.reduce((acc, s) => {
    if (!acc[s.maturity]) acc[s.maturity] = [];
    acc[s.maturity].push(s);
    return acc;
  }, {} as Record<string, SourceConfig[]>);
}

/** Summary stats for display */
export function getSourcesSummary(): {
  total: number;
  byTier: Record<number, number>;
  byMaturity: Record<string, number>;
  byType: Record<string, number>;
  enabled: number;
} {
  const byTier: Record<number, number> = {};
  const byMaturity: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let enabled = 0;

  for (const s of SOURCES) {
    byTier[s.tier] = (byTier[s.tier] || 0) + 1;
    byMaturity[s.maturity] = (byMaturity[s.maturity] || 0) + 1;
    byType[s.type] = (byType[s.type] || 0) + 1;
    if (s.enabled) enabled++;
  }

  return { total: SOURCES.length, byTier, byMaturity, byType, enabled };
}
