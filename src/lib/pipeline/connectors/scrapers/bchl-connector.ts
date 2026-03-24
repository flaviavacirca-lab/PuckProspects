// ============================================================================
// BCHL (British Columbia Hockey League) Connector
// ============================================================================
// Source: https://bchl.ca/stats
// Type: hybrid (likely HockeyTech)
// Maturity: scaffolded
//
// The BCHL is a top CJHL (Canadian Junior A) league. Many BCHL players
// go on to NCAA programs and some get drafted. Uses HockeyTech for stats.
//
// TODO:
// - [ ] Confirm BCHL uses HockeyTech (likely)
// - [ ] Find HockeyTech client key
// - [ ] Implement via shared HockeyTech parser
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class BchlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'bchl',
    sourceType: 'hybrid',
    sourceUrl: 'https://bchl.ca/stats',
    league: 'bchl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Likely HockeyTech — client key needs discovery',
      'Lower prospect tier than CHL/USHL',
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

registry.register('bchl', () => new BchlConnector());
