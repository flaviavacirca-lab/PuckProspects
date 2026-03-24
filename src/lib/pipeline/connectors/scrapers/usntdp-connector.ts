// ============================================================================
// US NTDP Connector
// ============================================================================
// Source: https://www.usahockeyntdp.com/stats
// Type: scrape
// Maturity: scaffolded
//
// The US National Team Development Program is critical for tracking
// top American draft prospects. Most top US-born draft picks come through
// the NTDP. Stats are on the USNTDP website.
//
// TODO:
// - [ ] Investigate usahockeyntdp.com stats page structure
// - [ ] May use HockeyTech or custom CMS
// - [ ] Parse U17 and U18 team stats separately
// - [ ] Small roster sizes (25-30 per team) — manageable dataset
// - [ ] High prospect relevance — priority implementation
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class UsntdpConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'usntdp',
    sourceType: 'scrape',
    sourceUrl: 'https://www.usahockeyntdp.com/stats',
    league: 'usntdp',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Small dataset but high value',
      'Page structure unclear',
      'May have U17 and U18 as separate views',
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

registry.register('usntdp', () => new UsntdpConnector());
