// ============================================================================
// SHL (Swedish Hockey League) Connector
// ============================================================================
// Source: https://www.shl.se/statistik
// Type: hybrid (shl.se uses a JSON API for stats)
// Maturity: scaffolded
//
// The SHL website fetches stats from an internal API. The stats page
// loads data via XHR requests that return JSON.
//
// API pattern (inspect network tab):
//   https://www.shl.se/api/seasons/{seasonId}/statistics/players?sort=points
//
// TODO:
// - [ ] Map SHL internal API endpoints
// - [ ] Determine season ID format (e.g., "qcz-3rVR5AUZB" style)
// - [ ] Fetch player stats JSON
// - [ ] Handle Swedish characters in player names
// - [ ] Parse team affiliations
// - [ ] SHL is high priority — many top prospects play here
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class ShlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'shl',
    sourceType: 'hybrid',
    sourceUrl: 'https://www.shl.se/statistik',
    league: 'shl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Internal API — endpoints may change',
      'Season IDs are opaque strings',
      'Swedish character encoding in names',
      'May require specific headers or cookies',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: false,
      hasIceTime: true,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: true,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Discover SHL API season ID and fetch stats endpoint
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

registry.register('shl', () => new ShlConnector());
