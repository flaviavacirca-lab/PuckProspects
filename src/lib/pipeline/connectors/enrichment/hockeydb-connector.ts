// ============================================================================
// HockeyDB Enrichment Connector
// ============================================================================
// Source: https://www.hockeydb.com/
// Type: enrichment (scrape)
// Maturity: scaffolded
//
// HockeyDB is a comprehensive hockey encyclopedia. Useful for:
// - Historical player data and career timelines
// - Player biographical info (DOB, birthplace, height, weight)
// - Draft information
// - Career transaction history
// - Cross-referencing player identities
//
// NOT a primary stats source — use for enriching players already in our DB.
//
// URL patterns:
//   Player: https://www.hockeydb.com/ihdb/stats/pdisplay.php?pid=XXXXX
//   Search: https://www.hockeydb.com/ihdb/stats/findplayer.php?full_name=...
//
// TODO:
// - [ ] Implement player search by name
// - [ ] Scrape player bio pages for DOB, height, weight, draft info
// - [ ] Parse career stats table for transaction history
// - [ ] Use for identity enrichment (fill in missing bio fields)
// - [ ] Respect rate limits — this is a community resource
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class HockeyDbConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'hockeydb',
    sourceType: 'enrichment',
    sourceUrl: 'https://www.hockeydb.com/',
    league: '*',
    ingestionCadence: 'weekly',
    maturity: 'scaffolded',
    tier: 3,
    leaguesCovered: ['ahl', 'ohl', 'whl', 'qmjhl', 'ncaa', 'ushl', 'shl', 'liiga', 'khl'],
    knownLimitations: [
      'Enrichment only — not a primary stats source',
      'HTML scraping required (traditional tables)',
      'Rate limit: be very conservative (community resource)',
      'Player search may return multiple matches',
      'Historical data strong, current season may lag',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: true,
      hasDraftInfo: true,
      hasNhlAffiliation: true,
      customFields: ['careerTimeline', 'transactionHistory'],
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // Enrichment connectors work differently: they take existing players
    // and fetch additional data for them, rather than fetching a full dataset.
    // TODO: Implement search-by-name for players missing bio/draft data
    throw new Error(`[${this.descriptor.sourceName}] fetch() not yet implemented`);
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    // TODO: Parse HockeyDB player pages with Cheerio
    // Key elements: bio table, career stats table, draft info
    throw new Error(`[${this.descriptor.sourceName}] parse() not yet implemented`);
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    // TODO: Map HockeyDB bio/draft fields to NormalizedPlayer
    // Focus on: dateOfBirth, birthCity, birthCountry, heightCm, weightKg,
    //           draftYear, draftRound, draftPick, draftedBy, nhlRightsHolder
    throw new Error(`[${this.descriptor.sourceName}] normalize() not yet implemented`);
  }
}

registry.register('hockeydb', () => new HockeyDbConnector());
