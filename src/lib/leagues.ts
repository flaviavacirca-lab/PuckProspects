// League registry — single source of truth for all supported leagues.
// Each entry maps to a connector module in backend/connectors/.

export interface LeagueConfig {
  code: string;
  name: string;
  shortName: string;
  country: string;
  level: string;
  tier: number;
  sourceUrl: string;
  connectorStatus: 'active' | 'partial' | 'manual' | 'placeholder';
  category: string;
}

export const LEAGUES: LeagueConfig[] = [
  // ── North American Pro & Junior Pipeline ──
  { code: 'ahl',   name: 'American Hockey League',                shortName: 'AHL',   country: 'USA/Canada', level: 'pro',     tier: 1, sourceUrl: 'https://theahl.com/stats',                       connectorStatus: 'placeholder', category: 'NA Pro' },
  { code: 'echl',  name: 'ECHL',                                  shortName: 'ECHL',  country: 'USA/Canada', level: 'pro',     tier: 2, sourceUrl: 'https://echl.com/stats',                         connectorStatus: 'placeholder', category: 'NA Pro' },
  { code: 'ohl',   name: 'Ontario Hockey League',                  shortName: 'OHL',   country: 'Canada',     level: 'junior',  tier: 1, sourceUrl: 'https://ontariohockeyleague.com/stats',          connectorStatus: 'placeholder', category: 'CHL' },
  { code: 'whl',   name: 'Western Hockey League',                  shortName: 'WHL',   country: 'Canada',     level: 'junior',  tier: 1, sourceUrl: 'https://whl.ca/stats',                           connectorStatus: 'placeholder', category: 'CHL' },
  { code: 'qmjhl', name: 'Quebec Major Junior Hockey League',      shortName: 'QMJHL', country: 'Canada',     level: 'junior',  tier: 1, sourceUrl: 'https://theqmjhl.ca/stats',                      connectorStatus: 'placeholder', category: 'CHL' },

  // ── NCAA & U.S. Junior ──
  { code: 'ncaa',  name: 'NCAA Division I Men\'s Ice Hockey',      shortName: 'NCAA',  country: 'USA',        level: 'college', tier: 1, sourceUrl: 'https://www.ncaa.com/stats/icehockey-men/d1',    connectorStatus: 'placeholder', category: 'US College/Junior' },
  { code: 'ushl',  name: 'United States Hockey League',            shortName: 'USHL',  country: 'USA',        level: 'junior',  tier: 1, sourceUrl: 'https://ushl.com/stats',                         connectorStatus: 'placeholder', category: 'US College/Junior' },
  { code: 'nahl',  name: 'North American Hockey League',           shortName: 'NAHL',  country: 'USA',        level: 'junior',  tier: 2, sourceUrl: 'https://nahl.com/stats',                         connectorStatus: 'placeholder', category: 'US College/Junior' },

  // ── European Pro Leagues ──
  { code: 'shl',   name: 'Swedish Hockey League',                  shortName: 'SHL',   country: 'Sweden',     level: 'pro',     tier: 1, sourceUrl: 'https://www.shl.se/statistik',                   connectorStatus: 'placeholder', category: 'European Pro' },
  { code: 'j20',   name: 'J20 Nationell',                          shortName: 'J20',   country: 'Sweden',     level: 'u20',     tier: 2, sourceUrl: 'https://stats.swehockey.se/',                    connectorStatus: 'placeholder', category: 'European Dev' },
  { code: 'liiga', name: 'Liiga',                                  shortName: 'Liiga', country: 'Finland',    level: 'pro',     tier: 1, sourceUrl: 'https://liiga.fi/en/statistics',                 connectorStatus: 'placeholder', category: 'European Pro' },
  { code: 'khl',   name: 'Kontinental Hockey League',              shortName: 'KHL',   country: 'Russia',     level: 'pro',     tier: 1, sourceUrl: 'https://en.khl.ru/stat/',                       connectorStatus: 'placeholder', category: 'European Pro' },
  { code: 'mhl',   name: 'MHL',                                    shortName: 'MHL',   country: 'Russia',     level: 'u20',     tier: 2, sourceUrl: 'https://mhl.khl.ru/stat/',                      connectorStatus: 'placeholder', category: 'European Dev' },
  { code: 'nl',    name: 'National League',                        shortName: 'NL',    country: 'Switzerland',level: 'pro',     tier: 1, sourceUrl: 'https://www.sihf.ch/en/game-center/national-league/#/statistics', connectorStatus: 'placeholder', category: 'European Pro' },
  { code: 'del',   name: 'Deutsche Eishockey Liga',                shortName: 'DEL',   country: 'Germany',    level: 'pro',     tier: 1, sourceUrl: 'https://www.penny-del.org/statistik',            connectorStatus: 'placeholder', category: 'European Pro' },
  { code: 'elh',   name: 'Czech Extraliga',                        shortName: 'ELH',   country: 'Czech Republic', level: 'pro', tier: 1, sourceUrl: 'https://www.hokej.cz/statistiky',                connectorStatus: 'placeholder', category: 'European Pro' },

  // ── International Development ──
  { code: 'usntdp',       name: 'USA Hockey NTDP',                 shortName: 'NTDP',  country: 'USA',        level: 'development', tier: 1, sourceUrl: 'https://www.usahockeyntdp.com/stats',       connectorStatus: 'placeholder', category: 'Development' },
  { code: 'bchl',         name: 'British Columbia Hockey League',   shortName: 'BCHL',  country: 'Canada',     level: 'junior',      tier: 2, sourceUrl: 'https://bchl.ca/stats',                     connectorStatus: 'placeholder', category: 'CJHL' },
  { code: 'hockey_canada',name: 'Hockey Canada Programs',          shortName: 'HC',    country: 'Canada',     level: 'development', tier: 2, sourceUrl: 'https://www.hockeycanada.ca/en-ca',         connectorStatus: 'placeholder', category: 'Development' },

  // ── Future / Partial Connectors ──
  { code: 'swe_u18',  name: 'Swedish U18 Leagues',                 shortName: 'SWE-U18', country: 'Sweden',     level: 'u18', tier: 3, sourceUrl: '', connectorStatus: 'placeholder', category: 'Future' },
  { code: 'rus_u18',  name: 'Russian U18 Leagues',                 shortName: 'RUS-U18', country: 'Russia',     level: 'u18', tier: 3, sourceUrl: '', connectorStatus: 'placeholder', category: 'Future' },
  { code: 'us_prep',  name: 'US Prep/High School Hockey',          shortName: 'PREP',    country: 'USA',        level: 'u18', tier: 3, sourceUrl: '', connectorStatus: 'placeholder', category: 'Future' },
  { code: 'eur_u18',  name: 'European U18 Leagues',                shortName: 'EUR-U18', country: 'Europe',     level: 'u18', tier: 3, sourceUrl: '', connectorStatus: 'placeholder', category: 'Future' },
  { code: 'cjhl',     name: 'Canadian Junior Hockey League',       shortName: 'CJHL',    country: 'Canada',     level: 'junior', tier: 3, sourceUrl: '', connectorStatus: 'placeholder', category: 'Future' },
];

export function getLeague(code: string): LeagueConfig | undefined {
  return LEAGUES.find(l => l.code === code);
}

export function getActiveLeagues(): LeagueConfig[] {
  return LEAGUES.filter(l => l.connectorStatus !== 'placeholder');
}

export function getLeaguesByCategory(): Record<string, LeagueConfig[]> {
  return LEAGUES.reduce((acc, league) => {
    if (!acc[league.category]) acc[league.category] = [];
    acc[league.category].push(league);
    return acc;
  }, {} as Record<string, LeagueConfig[]>);
}
