// ============================================================================
// OHL Connector
// ============================================================================
// Source: https://ontariohockeyleague.com/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: scaffolded
//
// The OHL uses HockeyTech for stats. High prospect relevance — the OHL
// is a top CHL league producing many NHL draft picks annually.
//
// HockeyTech feed: lscluster.hockeytech.com with league=ohl
// Client key: "2976319eb44abe94" (verify in page source)
//
// TODO:
// - [ ] Confirm OHL HockeyTech client key
// - [ ] Implement HockeyTech JSON feed fetch
// - [ ] Parse player + goalie stats
// - [ ] Map OHL team names to our team registry
// - [ ] Consider shared HockeyTech parser utility (AHL/OHL/WHL/QMJHL pattern)
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class OhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'ohl',
    sourceType: 'hybrid',
    sourceUrl: 'https://ontariohockeyleague.com/stats',
    league: 'ohl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key may change',
      'JSON feed is undocumented',
      'Draft eligibility not directly available',
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

registry.register('ohl', () => new OhlConnector());
