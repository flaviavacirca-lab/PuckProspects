// ============================================================================
// Czech Extraliga Connector
// ============================================================================
// Source: https://www.hokej.cz/statistiky
// Type: scrape or hybrid
// Maturity: scaffolded
//
// The Czech Extraliga stats are on hokej.cz. The site may use
// server-rendered HTML or an internal API.
//
// TODO:
// - [ ] Investigate hokej.cz page structure
// - [ ] Check for internal JSON API
// - [ ] Handle Czech diacritics in names (háčky, čárky)
// - [ ] Parse player stats
// - [ ] Czech league produces NHL-caliber prospects regularly
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class CzechExtraligaConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'czech_extraliga',
    sourceType: 'scrape',
    sourceUrl: 'https://www.hokej.cz/statistiky',
    league: 'elh',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Czech language site',
      'Czech diacritics in names',
      'Page structure unclear',
      'May require specific locale headers',
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

registry.register('czech_extraliga', () => new CzechExtraligaConnector());
