// ============================================================================
// NHL Unofficial API Connector
// ============================================================================
// Source: https://api-web.nhle.com
// Type: API (unofficial, no key required)
// Maturity: scaffolded
//
// The NHL's unofficial web API powers nhle.com. It provides rich data on
// NHL players, prospects, and draft picks. Useful for:
// - NHL draft history and prospect rights
// - Player biographical data
// - NHL affiliate relationships
// - Prospect graduation tracking
//
// Key endpoints:
//   GET /v1/player/{id}/landing          — player bio + career stats
//   GET /v1/draft/rankings/now           — current draft rankings
//   GET /v1/standings/now                — current standings
//   GET /v1/prospects                    — NHL prospect pool
//   GET /v1/roster/{team}/current        — team rosters
//   GET /v1/club-stats/{team}/now        — team stats
//
// TODO:
// - [ ] Map all relevant endpoints for prospect data
// - [ ] Implement fetch for prospect pool endpoint
// - [ ] Parse player bio JSON into NormalizedPlayer
// - [ ] Extract draft info and NHL rights data
// - [ ] Handle pagination if applicable
// - [ ] Rate limit: unknown, be conservative (5 req/s)
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class NhlApiConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'nhl_api',
    sourceType: 'api',
    sourceUrl: 'https://api-web.nhle.com',
    league: '*',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 1,
    leaguesCovered: ['ahl', 'ohl', 'whl', 'qmjhl', 'ncaa', 'shl', 'liiga', 'khl'],
    knownLimitations: [
      'Unofficial API — no stability guarantees',
      'No API key required but may rate limit',
      'Only covers players with NHL draft/rights connections',
      'Does not cover undrafted prospects without NHL affiliation',
      'Response schema can change without notice',
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
      hasDraftInfo: true,
      hasNhlAffiliation: true,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Implement — fetch from /v1/prospects and /v1/draft endpoints
    // Example:
    //   const prospects = await this.fetchJson('https://api-web.nhle.com/v1/prospects');
    //   const draft = await this.fetchJson('https://api-web.nhle.com/v1/draft/rankings/now');
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    // TODO: Parse NHL API JSON responses into ParsedRecords
    // The API returns structured JSON so parsing is straightforward
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    // TODO: Map NHL API fields to normalized schema
    // Key mappings:
    //   playerId → sourceIds['nhl_api']
    //   firstName, lastName → identity fields
    //   birthDate → dateOfBirth
    //   birthCity, birthCountry → bio fields
    //   draftYear, draftRound, draftOverall → draft info
    //   currentTeam → nhlRightsHolder
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const result = await this.fetchUrl('https://api-web.nhle.com/v1/standings/now', {
      retries: 0,
      timeout: 10000,
    });
    if (!result) return { healthy: false, message: 'Connection failed' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    return { healthy: true, message: 'OK' };
  }
}

registry.register('nhl_api', () => new NhlApiConnector());
