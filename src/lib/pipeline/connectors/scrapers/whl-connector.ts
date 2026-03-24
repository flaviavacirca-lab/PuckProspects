// ============================================================================
// WHL Connector
// ============================================================================
// Source: https://whl.ca/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: scaffolded
//
// The WHL uses HockeyTech for stats. High prospect relevance.
// Client key: "41b145a848f4bd67" (verify in page source)
//
// TODO:
// - [ ] Confirm WHL HockeyTech client key
// - [ ] Implement via shared HockeyTech feed parser
// - [ ] Parse player + goalie stats
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class WhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'whl',
    sourceType: 'hybrid',
    sourceUrl: 'https://whl.ca/stats',
    league: 'whl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key may change',
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

registry.register('whl', () => new WhlConnector());
