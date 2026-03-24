// ============================================================================
// Hockey Canada Ecosystem Connector
// ============================================================================
// Source: https://www.hockeycanada.ca/en-ca
// Type: scrape (multiple sub-sites)
// Maturity: future
//
// Hockey Canada oversees national team programs (WJC, U18, etc.) and
// sanctions various junior leagues. Stats are spread across multiple
// sub-sites and may not be consistently available.
//
// This is primarily an enrichment/metadata source:
// - National team rosters and results
// - Development camp invitees
// - Player program participation
//
// The actual league stats (CHL, etc.) come from league-specific connectors.
//
// TODO:
// - [ ] Determine which HC sub-sites have scrapable stats
// - [ ] WJC/U18 rosters would be valuable for prospect tagging
// - [ ] May be better as a manual/enrichment source
// - [ ] Consider Hockey Canada registry (HCR) if accessible
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import { registry } from '../registry';

export class HockeyCanadaConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'hockey_canada',
    sourceType: 'enrichment',
    sourceUrl: 'https://www.hockeycanada.ca/en-ca',
    league: 'hockey_canada',
    ingestionCadence: 'weekly',
    maturity: 'future',
    tier: 2,
    leaguesCovered: ['ohl', 'whl', 'qmjhl'],
    knownLimitations: [
      'Stats spread across multiple sub-sites',
      'Primarily metadata/enrichment, not primary stats',
      'National team programs are seasonal/event-based',
      'No clear API or consistent stats page',
    ],
    fieldCoverage: {
      hasBasicStats: false,
      hasPlusMinus: false,
      hasSpecialTeams: false,
      hasShots: false,
      hasFaceoffs: false,
      hasIceTime: false,
      hasHitsBlocks: false,
      hasGoalieStats: false,
      hasBiographicalData: true,
      hasDraftInfo: false,
      hasNhlAffiliation: false,
      customFields: ['nationalTeamRoster', 'developmentCamp'],
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

registry.register('hockey_canada', () => new HockeyCanadaConnector());
