// ============================================================================
// NCAA D1 Men's Ice Hockey Connector
// ============================================================================
// Source: https://www.ncaa.com/stats/icehockey-men/d1
// Type: scrape (HTML) or hybrid (NCAA has internal JSON endpoints)
// Maturity: scaffolded
//
// NCAA stats are available on ncaa.com. The page uses client-side rendering
// with data fetched from internal API endpoints.
//
// Potential approaches:
// 1. Scrape the rendered HTML (needs headless browser or wait for SSR)
// 2. Find and use the internal JSON API that powers the stats page
// 3. Use College Hockey Inc or USCHO as alternative sources
//
// Internal API pattern (inspect network requests):
//   https://stats.ncaa.org/rankings/change_sport_year_div
//   https://stats.ncaa.org/player/game_by_game?...
//
// TODO:
// - [ ] Investigate ncaa.com network requests for JSON API
// - [ ] Determine if stats.ncaa.org endpoints are accessible
// - [ ] Consider USCHO (https://www.uscho.com/stats/) as fallback
// - [ ] Handle the large number of NCAA teams (60+ D1 programs)
// - [ ] Map NCAA team names to our registry
// - [ ] NCAA stats often use different column names
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class NcaaConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'ncaa',
    sourceType: 'scrape',
    sourceUrl: 'https://www.ncaa.com/stats/icehockey-men/d1',
    league: 'ncaa',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'NCAA site uses heavy client-side rendering',
      'May need headless browser or internal JSON API discovery',
      'Large dataset (60+ teams, 1000+ players)',
      'Stats column names differ from other leagues',
      'No API key but aggressive anti-scraping possible',
      'Season schedule differs from hockey calendar',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: true,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: false,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Investigate JSON API behind ncaa.com stats pages
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

registry.register('ncaa', () => new NcaaConnector());
