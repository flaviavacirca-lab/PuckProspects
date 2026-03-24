// ============================================================================
// TheSportsDB Connector
// ============================================================================
// Source: https://www.thesportsdb.com/api.php
// Type: API (free tier available, Patreon for full access)
// Maturity: scaffolded
//
// TheSportsDB is primarily useful as an enrichment source:
// - Player photos and thumbnails
// - Team logos and banners
// - Player biographical data
// - Team metadata
// Not strong on detailed game/season statistics.
//
// Key endpoints:
//   GET /api/v1/json/{key}/searchplayers.php?p={name}   — player search
//   GET /api/v1/json/{key}/lookup_all_players.php?id=X   — team roster
//   GET /api/v1/json/{key}/lookupteam.php?id=X           — team detail
//   GET /api/v1/json/{key}/search_all_leagues.php?s=Ice%20Hockey — leagues
//
// Auth: API key in URL path (free key: "1" for testing)
// Rate limit: 100 req/min (Patreon for higher)
//
// TODO:
// - [ ] Test which hockey leagues have coverage
// - [ ] Map player search to our identity system
// - [ ] Extract biographical/media data for enrichment
// - [ ] Determine if stats coverage is deep enough to be useful
// - [ ] May be better as enrichment-only (photos, bios)
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class TheSportsDBConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'thesportsdb',
    sourceType: 'hybrid', // API for data, but likely enrichment use case
    sourceUrl: 'https://www.thesportsdb.com/api/v1/json/',
    league: '*',
    ingestionCadence: 'weekly',
    maturity: 'scaffolded',
    tier: 1,
    leaguesCovered: [], // TBD — needs testing
    knownLimitations: [
      'Free key ("1") has limited access',
      'Patreon required for full API',
      'Stats coverage is shallow — better for bios/photos',
      'Hockey league coverage unclear',
      'Best used as enrichment source, not primary stats',
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
      hasDraftInfo: false,
      hasNhlAffiliation: false,
      customFields: ['playerThumb', 'playerBanner', 'teamBadge', 'teamLogo'],
    },
  };

  async fetch(): Promise<FetchResult[]> {
    const apiKey = process.env.THESPORTSDB_API_KEY || '1'; // "1" = free test key

    // TODO: Implement — search for hockey players/teams
    // const result = await this.fetchJson(
    //   `https://www.thesportsdb.com/api/v1/json/${apiKey}/search_all_leagues.php?s=Ice%20Hockey`
    // );
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }
}

registry.register('thesportsdb', () => new TheSportsDBConnector());
