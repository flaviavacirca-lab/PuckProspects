// ============================================================================
// QMJHL Connector — IMPLEMENTED
// ============================================================================
// Source: https://theqmjhl.ca/stats
// Type: hybrid (HockeyTech Leaguestat JSON feed)
// Maturity: implemented
//
// The QMJHL (Quebec Major Junior Hockey League) is one of the three CHL
// major junior leagues. French-Canadian league — names often have accents
// (é, è, ê, etc.) which the identity resolution layer handles via
// NFD normalization.
// Uses the shared HockeyTech connector; client key: "f1aa699db3d81487"
// ============================================================================

import { HockeyTechConnector } from './hockeytech-connector';
import { registry } from '../registry';

const SEASON = '2025-2026';

export class QmjhlConnector extends HockeyTechConnector {
  constructor(season = SEASON) {
    super({
      league: 'qmjhl',
      label: 'QMJHL (Quebec Major Junior Hockey League)',
      sourceUrl: 'https://theqmjhl.ca/stats',
      season,
      tier: 2,
      knownLimitations: [
        'HockeyTech client key may change (verify at theqmjhl.ca)',
        'French-language names with accents (é, è, ê) — handled by normalization',
        'JSON feed is undocumented / unofficial',
        'Player IDs are HockeyTech-specific, not universal',
        'Birthdate format varies; some records missing DOB',
      ],
    });
  }
}

registry.register('qmjhl', () => new QmjhlConnector());
