// ============================================================================
// Liiga (Finnish Elite League) Connector
// ============================================================================
// Source: https://liiga.fi/en/statistics
// Type: hybrid (liiga.fi uses an internal JSON API)
// Maturity: scaffolded
//
// Liiga's website fetches stats from an internal API. The English version
// at liiga.fi/en/statistics loads player data via XHR.
//
// API pattern (inspect network tab):
//   https://liiga.fi/api/v1/players/stats?season=2025&tournament=runkosarja
//
// TODO:
// - [ ] Map liiga.fi internal API endpoints
// - [ ] Test API access (may need cookies/session)
// - [ ] Parse player stats from JSON
// - [ ] Handle Finnish characters in names
// - [ ] Liiga is high priority — top Finnish prospect league
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class LiigaConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'liiga',
    sourceType: 'hybrid',
    sourceUrl: 'https://liiga.fi/en/statistics',
    league: 'liiga',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'Internal API — may require session/cookies',
      'Finnish name encoding',
      'Tournament/season parameter format unclear',
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

registry.register('liiga', () => new LiigaConnector());
