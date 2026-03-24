// ============================================================================
// DEL (Deutsche Eishockey Liga) Connector
// ============================================================================
// Source: https://www.penny-del.org/statistik
// Type: scrape or hybrid
// Maturity: scaffolded
//
// The DEL website provides player statistics. May use client-side
// rendering with an internal API, or server-rendered HTML tables.
//
// TODO:
// - [ ] Investigate penny-del.org page structure
// - [ ] Check for internal JSON API (XHR requests)
// - [ ] Handle German characters (umlauts) in names
// - [ ] Parse player stats
// - [ ] German league has growing prospect pipeline
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class DelConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'del',
    sourceType: 'scrape',
    sourceUrl: 'https://www.penny-del.org/statistik',
    league: 'del',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Page structure unclear — needs investigation',
      'German umlaut handling in names',
      'May use SPA with client-side rendering',
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

registry.register('del', () => new DelConnector());
