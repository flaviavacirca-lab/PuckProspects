// ============================================================================
// ECHL Connector
// ============================================================================
// Source: https://echl.com/stats
// Type: hybrid (likely HockeyTech-based, similar to AHL)
// Maturity: scaffolded
//
// The ECHL also uses HockeyTech's Leaguestat system for stats.
// Same JSON feed pattern as AHL but with a different client key.
//
// TODO:
// - [ ] Find ECHL HockeyTech client key (inspect page source)
// - [ ] Test JSON feed access
// - [ ] Implement fetch + parse (reuse HockeyTech pattern from AHL)
// - [ ] ECHL has less prospect relevance — lower priority
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class EchlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'echl',
    sourceType: 'hybrid',
    sourceUrl: 'https://echl.com/stats',
    league: 'echl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key needs discovery',
      'Lower prospect relevance than AHL/CHL',
      'Same HockeyTech feed pattern as AHL',
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
      hasNhlAffiliation: true,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Discover ECHL HockeyTech client key, then fetch JSON feed
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

registry.register('echl', () => new EchlConnector());
