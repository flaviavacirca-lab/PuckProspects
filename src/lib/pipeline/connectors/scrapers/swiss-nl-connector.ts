// ============================================================================
// Swiss National League Connector
// ============================================================================
// Source: https://www.sihf.ch/en/game-center/national-league/#/statistics
// Type: hybrid (SIHF site uses internal JSON API)
// Maturity: scaffolded
//
// The Swiss Ice Hockey Federation (SIHF) site loads stats via XHR.
// The internal API likely returns JSON that populates the stats table.
//
// TODO:
// - [ ] Inspect SIHF network requests for JSON API
// - [ ] Map API endpoint structure
// - [ ] Handle multilingual names (German/French/Italian)
// - [ ] Parse player stats
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class SwissNlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'swiss_nl',
    sourceType: 'hybrid',
    sourceUrl: 'https://www.sihf.ch/en/game-center/national-league/#/statistics',
    league: 'nl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'SPA with hash-based routing — needs API discovery',
      'Multilingual (DE/FR/IT) name variants',
      'Internal API structure unclear',
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

registry.register('swiss_nl', () => new SwissNlConnector());
