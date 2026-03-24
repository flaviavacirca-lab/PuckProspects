// ============================================================================
// API-Hockey (API-Sports) Connector
// ============================================================================
// Source: https://api-sports.io (hockey endpoint)
// Type: API (requires API key)
// Maturity: scaffolded
//
// API-Sports provides multi-league hockey data. Strong for European leagues.
// Covers NHL, AHL, CHL, SHL, Liiga, KHL, DEL, NL, Czech Extraliga, and more.
//
// Key endpoints:
//   GET /hockey/players         — player search
//   GET /hockey/players/stats   — player season stats
//   GET /hockey/teams           — team listing
//   GET /hockey/leagues         — available leagues
//   GET /hockey/standings       — league standings
//
// Auth: x-apisports-key header
// Rate limit: 100 req/day (free), higher on paid plans
//
// TODO:
// - [ ] Sign up and get API key
// - [ ] Test which leagues have prospect-level data
// - [ ] Map /hockey/leagues to our league codes
// - [ ] Implement player stats fetch with league filtering
// - [ ] Parse JSON responses
// - [ ] Handle daily rate limit carefully
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class ApiHockeyConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'api_hockey',
    sourceType: 'api',
    sourceUrl: 'https://v1.hockey.api-sports.io',
    league: '*',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 1,
    leaguesCovered: ['ahl', 'ohl', 'whl', 'qmjhl', 'shl', 'liiga', 'khl', 'del', 'nl', 'elh'],
    knownLimitations: [
      'Requires API key (x-apisports-key header)',
      'Free tier: 100 requests/day',
      'Prospect-level coverage varies by league',
      'May not cover junior/college leagues in depth',
      'Rate limits require careful request batching',
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
    const apiKey = process.env.API_HOCKEY_KEY;
    if (!apiKey) throw new Error('API_HOCKEY_KEY not configured');

    // TODO: Implement — fetch league list first, then player stats per league
    // const leagues = await this.fetchJson('https://v1.hockey.api-sports.io/leagues', {
    //   headers: { 'x-apisports-key': apiKey },
    // });
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    // TODO: Parse API-Hockey JSON responses
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    // TODO: Map API-Hockey fields to normalized schema
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }
}

registry.register('api_hockey', () => new ApiHockeyConnector());
