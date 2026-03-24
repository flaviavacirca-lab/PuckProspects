// ============================================================================
// NAHL Connector
// ============================================================================
// Source: https://nahl.com/stats
// Type: hybrid (HockeyTech Leaguestat)
// Maturity: scaffolded
//
// The NAHL uses HockeyTech for stats. Tier 2 junior league — feeds
// into USHL and NCAA programs. Lower prospect priority than CHL/USHL.
//
// TODO:
// - [ ] Find NAHL HockeyTech client key
// - [ ] Implement via shared HockeyTech feed parser
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class NahlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'nahl',
    sourceType: 'hybrid',
    sourceUrl: 'https://nahl.com/stats',
    league: 'nahl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key needs discovery',
      'Lower prospect relevance than USHL/CHL',
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

registry.register('nahl', () => new NahlConnector());
