// ============================================================================
// QMJHL Connector
// ============================================================================
// Source: https://theqmjhl.ca/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: scaffolded
//
// The QMJHL uses HockeyTech for stats. High prospect relevance.
// Client key: "f1aa699db3d81487" (verify in page source)
//
// TODO:
// - [ ] Confirm QMJHL HockeyTech client key
// - [ ] Implement via shared HockeyTech feed parser
// - [ ] Handle French-language player names (accent normalization)
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class QmjhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'qmjhl',
    sourceType: 'hybrid',
    sourceUrl: 'https://theqmjhl.ca/stats',
    league: 'qmjhl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key may change',
      'French-language names need accent handling',
      'JSON feed is undocumented',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: false,
      hasIceTime: false,
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

registry.register('qmjhl', () => new QmjhlConnector());
