// ============================================================================
// MoneyPuck Enrichment Connector
// ============================================================================
// Source: https://moneypuck.com/
// Type: enrichment (data downloads / scrape)
// Maturity: future
//
// MoneyPuck provides NHL expected goals models, win probabilities,
// and shot-based analytics. They also offer downloadable CSV data files.
//
// Useful for:
// - Expected goals (xG) models
// - Win probability models
// - Shot location data
// - Player-level xG impact
//
// Like Natural Stat Trick, this is NHL-focused. Low priority for
// prospect-level analytics until we need advanced NHL metrics.
//
// TODO:
// - [ ] Check if CSV data downloads are still available
// - [ ] Determine prospect utility (AHL data?)
// - [ ] Low priority — implement only if we need advanced metrics
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class MoneyPuckConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'moneypuck',
    sourceType: 'enrichment',
    sourceUrl: 'https://moneypuck.com/',
    league: '*',
    ingestionCadence: 'weekly',
    maturity: 'future',
    tier: 3,
    leaguesCovered: [],
    knownLimitations: [
      'NHL-level data only',
      'CSV downloads may change format',
      'Low prospect utility',
      'Future implementation only if advanced metrics needed',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: false,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: false,
      hasIceTime: true,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: false,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
      customFields: ['xGoals', 'xGoalsAgainst', 'shotAttempts'],
    },
  };

  async fetch(): Promise<FetchResult[]> {
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented — future source`);
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

registry.register('moneypuck', () => new MoneyPuckConnector());
