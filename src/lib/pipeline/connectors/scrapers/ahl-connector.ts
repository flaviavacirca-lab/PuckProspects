// ============================================================================
// AHL Connector — IMPLEMENTED
// ============================================================================
// Source: https://theahl.com/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: implemented
//
// The AHL (American Hockey League) is the primary development league for
// the NHL. Every NHL team has an AHL affiliate. Very high prospect
// relevance — players here are one step from the NHL.
// Uses the shared HockeyTech connector; client key: "50c2cd9b5e18e390"
//
// AHL-specific note: this is the only HockeyTech league where
// hasNhlAffiliation is true, because every AHL team is an NHL affiliate.
// The team name itself implies the affiliation (e.g., "Laval Rocket" →
// Montreal Canadiens). Cross-referencing with the NHL API connector
// can fill in explicit affiliation data.
// ============================================================================

import { HockeyTechConnector } from './hockeytech-connector';
import { registry } from '../registry';

const SEASON = '2025-2026';

export class AhlConnector extends HockeyTechConnector {
  constructor(season = SEASON) {
    super({
      league: 'ahl',
      label: 'AHL (American Hockey League)',
      sourceUrl: 'https://theahl.com/stats',
      season,
      tier: 2,
      knownLimitations: [
        'HockeyTech client key may change (verify at theahl.com)',
        'JSON feed is undocumented / unofficial',
        'Player IDs are HockeyTech-specific, not universal',
        'NHL affiliation not explicit in stats feed — inferred from team name',
        'Many AHL players also appear in NHL API data (identity resolution handles this)',
        'Birthdate format varies; some records missing DOB',
      ],
      fieldCoverageOverrides: {
        hasNhlAffiliation: true,
      },
    });
  }
}

registry.register('ahl', () => new AhlConnector());
