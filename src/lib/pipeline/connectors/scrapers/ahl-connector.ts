// ============================================================================
// AHL Connector
// ============================================================================
// Source: https://theahl.com/stats
// Type: hybrid (HockeyTech JSON API behind the stats pages)
// Maturity: scaffolded
//
// The AHL website uses HockeyTech's Leaguestat system. The stats pages
// make XHR requests to a JSON feed at lscluster.hockeytech.com.
// This means we can intercept the JSON API directly rather than scraping HTML.
//
// HockeyTech feed URL pattern:
//   https://lscluster.hockeytech.com/feed/?feed=statviewfeed
//     &view=players&season=20252026&league=ahl&sort=points
//     &key={client_key}&fmt=json
//
// The client key is embedded in the page source. Common AHL key: "50c2cd9b5e18e390"
//
// TODO:
// - [ ] Confirm current HockeyTech client key for AHL
// - [ ] Implement JSON feed fetch (not HTML scraping)
// - [ ] Parse player stats from JSON response
// - [ ] Handle goalie stats (separate view parameter)
// - [ ] Map team IDs to our team registry
// - [ ] Implement pagination if needed
// - [ ] Also consider: EP scraper as fallback for AHL
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

const HOCKEYTECH_BASE = 'https://lscluster.hockeytech.com/feed/';
// Client key is typically embedded in the league's website source
const AHL_CLIENT_KEY = '50c2cd9b5e18e390';

export class AhlConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'ahl',
    sourceType: 'hybrid',
    sourceUrl: 'https://theahl.com/stats',
    league: 'ahl',
    ingestionCadence: 'daily',
    maturity: 'scaffolded',
    tier: 2,
    knownLimitations: [
      'HockeyTech client key may change',
      'JSON feed is undocumented / unofficial',
      'Season format is concatenated (20252026 not 2025-26)',
      'Player IDs are HockeyTech-specific',
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
      hasNhlAffiliation: true, // AHL teams are NHL affiliates
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Fetch from HockeyTech JSON feed
    // const url = `${HOCKEYTECH_BASE}?feed=statviewfeed&view=players` +
    //   `&season=20252026&league=ahl&sort=points&key=${AHL_CLIENT_KEY}&fmt=json`;
    // const result = await this.fetchUrl(url);
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    // TODO: Parse HockeyTech JSON — structure is typically:
    // { SiteKit: { Statviewtype: [...players] } }
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    // TODO: Map HockeyTech fields:
    //   player_id, first_name, last_name, position, birthdate
    //   games_played, goals, assists, points, penalty_minutes, plus_minus
    //   power_play_goals, short_handed_goals, shots, team_name
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    const url = `${HOCKEYTECH_BASE}?feed=statviewfeed&view=players&season=20252026&league=ahl&sort=points&key=${AHL_CLIENT_KEY}&fmt=json&limit=1`;
    const result = await this.fetchUrl(url, { retries: 0, timeout: 10000 });
    if (!result) return { healthy: false, message: 'HockeyTech feed unreachable' };
    if (result.status !== 200) return { healthy: false, message: `HTTP ${result.status}` };
    return { healthy: true, message: 'OK' };
  }
}

registry.register('ahl', () => new AhlConnector());
