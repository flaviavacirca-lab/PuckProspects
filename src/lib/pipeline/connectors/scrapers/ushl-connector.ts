// ============================================================================
// USHL Connector
// ============================================================================
// Source: https://ushl.com/stats
// Type: hybrid (HockeyTech Leaguestat — same system as AHL/CHL)
// Maturity: scaffolded
//
// The USHL uses HockeyTech for stats. Important development league
// for US college prospects and NHL draft picks.
//
// TODO:
// - [ ] Find USHL HockeyTech client key
// - [ ] Implement via shared HockeyTech feed parser
// - [ ] Parse player + goalie stats
// - [ ] Map USHL teams to registry
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class UshlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'ushl',
    sourceType: 'hybrid',
    sourceUrl: 'https://ushl.com/stats',
    league: 'ushl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key needs discovery',
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

registry.register('ushl', () => new UshlConnector());
