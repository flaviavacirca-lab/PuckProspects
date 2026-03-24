// ============================================================================
// KHL (Kontinental Hockey League) Connector
// ============================================================================
// Source: https://en.khl.ru/stat/
// Type: scrape (HTML) or hybrid
// Maturity: scaffolded
//
// The KHL English stats site provides player statistics. The site may
// use server-side rendering with HTML tables, or may have internal API.
//
// TODO:
// - [ ] Investigate en.khl.ru page structure (HTML vs API)
// - [ ] Implement scraping or API fetch
// - [ ] Handle Russian/Cyrillic player names
// - [ ] Parse player stats tables
// - [ ] KHL has important prospects (late-round picks, European free agents)
// - [ ] May be blocked from some regions
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class KhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'khl',
    sourceType: 'scrape',
    sourceUrl: 'https://en.khl.ru/stat/',
    league: 'khl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Russian site — may have geo-restrictions',
      'Cyrillic name handling required',
      'Page structure unclear — needs investigation',
      'May use anti-scraping measures',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: false,
      hasIceTime: true,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: true,
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

registry.register('khl', () => new KhlConnector());
