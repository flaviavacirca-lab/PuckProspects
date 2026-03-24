// ============================================================================
// MoreHockeyStats Connector
// ============================================================================
// Source: https://morehockeystats.com/data/api
// Type: API
// Maturity: scaffolded
//
// MoreHockeyStats provides aggregated hockey statistics with an API.
// Potentially useful for:
// - Advanced stats and analytics
// - Cross-league comparisons
// - Historical data
//
// TODO:
// - [ ] Investigate API documentation and access requirements
// - [ ] Test endpoint availability and response formats
// - [ ] Determine which leagues/levels are covered
// - [ ] Map API fields to our normalized schema
// - [ ] Assess whether this is a primary or enrichment source
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class MoreHockeyStatsConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'morehockeystats',
    sourceType: 'api',
    sourceUrl: 'https://morehockeystats.com/data/api',
    league: '*',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 1,
    leaguesCovered: [], // TBD — needs investigation
    knownLimitations: [
      'API documentation needs investigation',
      'Access requirements unknown',
      'Coverage scope unclear',
      'May require registration or API key',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: false,
      hasBiographicalData: false,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Investigate API and implement
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented — API needs investigation`);
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

registry.register('morehockeystats', () => new MoreHockeyStatsConnector());
