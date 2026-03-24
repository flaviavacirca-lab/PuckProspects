// ============================================================================
// Source Configuration
// ============================================================================
// Defines which data sources are available, their connector types, and
// ingestion settings. This is the single place to enable/disable sources
// and configure their behavior.
//
// To add a new source:
// 1. Add an entry to SOURCES below
// 2. Create the connector in connectors/apis/ or connectors/scrapers/
// 3. Register it in connectors/registry.ts
// ============================================================================

import { SourceType, IngestionCadence } from '../domain/models';

export interface SourceConfig {
  /** Unique source identifier (matches connector sourceName) */
  name: string;
  /** Display label */
  label: string;
  /** Source type */
  type: SourceType;
  /** Which league this source provides data for */
  league: string;
  /** Base URL for the source */
  url: string;
  /** Whether this source is currently enabled */
  enabled: boolean;
  /** How often to ingest */
  cadence: IngestionCadence;
  /** Priority (lower = run first). Ties broken alphabetically. */
  priority: number;
  /** API key env var name (if applicable) */
  apiKeyEnv?: string;
  /** Rate limit: max requests per minute */
  rateLimit?: number;
  /** Custom config passed to the connector */
  config?: Record<string, unknown>;
}

/**
 * All configured data sources. Enable/disable sources here.
 *
 * Sources are organized by type:
 * - API sources: structured data from official APIs
 * - Scrape sources: HTML parsing from stat sites
 * - Enrichment sources: supplementary data (draft info, bios, etc.)
 */
export const SOURCES: SourceConfig[] = [
  // ── API-based sources ──
  // These will be implemented as connectors are built
  // {
  //   name: 'ahl_api',
  //   label: 'AHL Official API',
  //   type: 'api',
  //   league: 'ahl',
  //   url: 'https://lscluster.hockeytech.com/feed/',
  //   enabled: false,
  //   cadence: 'daily',
  //   priority: 10,
  //   apiKeyEnv: 'AHL_API_KEY',
  //   rateLimit: 30,
  // },

  // ── Scrape-based sources (Elite Prospects) ──
  // EP is the primary multi-league source. One connector per league.
  // Uncomment as connectors are implemented.
  // {
  //   name: 'ep_ohl',
  //   label: 'Elite Prospects - OHL',
  //   type: 'scrape',
  //   league: 'ohl',
  //   url: 'https://www.eliteprospects.com/league/ohl/stats/',
  //   enabled: false,
  //   cadence: 'daily',
  //   priority: 20,
  //   rateLimit: 10,
  //   config: { season: '2025-2026' },
  // },

  // ── Enrichment sources ──
  // {
  //   name: 'ep_enrichment',
  //   label: 'Elite Prospects - Player Bios',
  //   type: 'enrichment',
  //   league: '*',
  //   url: 'https://www.eliteprospects.com/player/',
  //   enabled: false,
  //   cadence: 'weekly',
  //   priority: 100,
  //   rateLimit: 5,
  // },
];

// ============================================================================
// Helper functions
// ============================================================================

/** Get all enabled sources */
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
