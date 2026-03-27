// ============================================================================
// WHL Connector — IMPLEMENTED
// ============================================================================
// Source: https://whl.ca/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: implemented
//
// The WHL (Western Hockey League) is one of the three CHL major junior
// leagues. High prospect relevance — produces many NHL draft picks.
// Uses the shared HockeyTech connector; client key: "41b145a848f4bd67"
// ============================================================================

import { HockeyTechConnector } from './hockeytech-connector';
import { registry } from '../registry';

const SEASON = '2025-2026';

export class WhlConnector extends HockeyTechConnector {
  constructor(season = SEASON) {
    super({
      league: 'whl',
      label: 'WHL (Western Hockey League)',
      sourceUrl: 'https://whl.ca/stats',
      season,
      tier: 2,
      knownLimitations: [
        'HockeyTech client key may change (verify at whl.ca)',
        'JSON feed is undocumented / unofficial',
        'Player IDs are HockeyTech-specific, not universal',
        'WHL spans US + Canada — birthplace data useful for nationality',
        'Birthdate format varies; some records missing DOB',
      ],
    });
  }
}

registry.register('whl', () => new WhlConnector());
