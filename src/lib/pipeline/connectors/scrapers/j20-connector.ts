// ============================================================================
// J20 Nationell Connector
// ============================================================================
// Source: https://stats.swehockey.se/
// Type: scrape (HTML tables)
// Maturity: scaffolded
//
// J20 Nationell is Sweden's top U20 league. Stats are on the Swedish
// Ice Hockey Association's stats site (stats.swehockey.se).
//
// The site renders traditional HTML tables — good candidate for Cheerio.
// URL pattern: stats.swehockey.se/ScheduleAndResults/Select?...
//
// TODO:
// - [ ] Map the stats.swehockey.se URL structure for J20
// - [ ] Implement HTML table scraping with Cheerio
// - [ ] Handle Swedish characters in names
// - [ ] Map season/league selection parameters
// - [ ] Lower priority than SHL but important for tracking young Swedish prospects
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class J20Connector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'j20',
    sourceType: 'scrape',
    sourceUrl: 'https://stats.swehockey.se/',
    league: 'j20',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Traditional HTML scraping required',
      'Swedish character encoding',
      'URL structure needs mapping',
      'Season/league selection is form-based',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: false,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  async fetch(): Promise<FetchResult[]> {
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

registry.register('j20', () => new J20Connector());
