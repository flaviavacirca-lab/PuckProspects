// ============================================================================
// Natural Stat Trick Enrichment Connector
// ============================================================================
// Source: https://www.naturalstattrick.com/
// Type: enrichment (scrape)
// Maturity: future
//
// Natural Stat Trick provides advanced NHL analytics. Useful for:
// - Expected goals (xG), Corsi, Fenwick
// - Shot quality metrics
// - On-ice impact metrics
// - Zone entry/exit data
//
// Primarily NHL-level data. Useful for enriching NHL-affiliated prospects
// who have played NHL games. Less useful for junior/college players.
//
// TODO:
// - [ ] Determine if any prospect-level data is available
// - [ ] May only be useful for AHL graduates / NHL callups
// - [ ] Low priority until we need advanced metrics
// - [ ] Aggressive anti-scraping measures possible
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class NaturalStatTrickConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'naturalstattrick',
    sourceType: 'enrichment',
    sourceUrl: 'https://www.naturalstattrick.com/',
    league: '*',
    ingestionCadence: 'weekly',
    maturity: 'future',
    tier: 3,
    leaguesCovered: [], // NHL-focused, limited prospect utility
    knownLimitations: [
      'NHL-level data only — limited prospect coverage',
      'Anti-scraping measures likely',
      'Advanced metrics require context to interpret',
      'Low priority for prospect analytics',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: true,
      hasIceTime: true,
      hasHitsBlocks: true,
      hasGoalieStats: true,
      hasBiographicalData: false,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
      customFields: ['xGoals', 'corsi', 'fenwick', 'shotQuality'],
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

registry.register('naturalstattrick', () => new NaturalStatTrickConnector());
