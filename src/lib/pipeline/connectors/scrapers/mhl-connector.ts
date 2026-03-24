// ============================================================================
// MHL (Russian Junior League) Connector
// ============================================================================
// Source: https://mhl.khl.ru/stat/
// Type: scrape
// Maturity: scaffolded
//
// MHL is Russia's top junior league. Stats on mhl.khl.ru.
// Similar structure to KHL site. Important for tracking Russian prospects.
//
// TODO:
// - [ ] Investigate mhl.khl.ru page structure
// - [ ] Handle Cyrillic names (transliteration)
// - [ ] May share scraping approach with KHL connector
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class MhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'mhl',
    sourceType: 'scrape',
    sourceUrl: 'https://mhl.khl.ru/stat/',
    league: 'mhl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Russian language site',
      'Cyrillic name transliteration needed',
      'May share KHL site anti-scraping measures',
      'Geo-restrictions possible',
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

registry.register('mhl', () => new MhlConnector());
