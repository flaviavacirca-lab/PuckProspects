// ============================================================================
// BallDontLie NHL API Connector
// ============================================================================
// Source: https://nhl.balldontlie.io
// Type: API (requires API key)
// Maturity: scaffolded
//
// BallDontLie provides a clean REST API for NHL stats. Useful for:
// - Player season stats with good field coverage
// - Team rosters and metadata
// - Game-level data
//
// Key endpoints:
//   GET /api/v1/players          — list/search players
//   GET /api/v1/players/:id      — player detail
//   GET /api/v1/season_stats     — season statistics
//   GET /api/v1/teams            — team listing
//
// Auth: API key via X-API-Key header
// Rate limit: varies by plan
//
// TODO:
// - [ ] Sign up for API key and test access
// - [ ] Map player search/listing endpoints
// - [ ] Implement season stats ingestion
// - [ ] Handle pagination (cursor-based)
// - [ ] Map to normalized schema
// - [ ] Determine which league stats are available (NHL only? AHL?)
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class BallDontLieConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'balldontlie',
    sourceType: 'api',
    sourceUrl: 'https://nhl.balldontlie.io',
    league: '*',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 1,
    leaguesCovered: [], // TBD — likely NHL-focused, may include AHL
    knownLimitations: [
      'Requires API key (X-API-Key header)',
      'Rate limited by plan tier',
      'Coverage scope unclear — may be NHL-only',
      'Pagination required for full data sets',
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
      hasBiographicalData: true,
      hasDraftInfo: false,
      hasNhlAffiliation: true,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    const apiKey = process.env.BALLDONTLIE_API_KEY;
    if (!apiKey) throw new Error('BALLDONTLIE_API_KEY not configured');

    // TODO: Implement paginated fetch
    // const players = await this.fetchJson('https://nhl.balldontlie.io/api/v1/players', {
    //   headers: { 'X-API-Key': apiKey },
    // });
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    // TODO: Parse BallDontLie JSON into ParsedRecords
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    // TODO: Map BallDontLie fields to normalized schema
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }
}

registry.register('balldontlie', () => new BallDontLieConnector());
