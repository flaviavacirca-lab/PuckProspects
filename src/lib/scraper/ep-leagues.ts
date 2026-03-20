/**
 * Maps internal league codes to Elite Prospects URL slugs.
 * Only includes leagues that have a known EP page.
 */
export const EP_LEAGUE_SLUGS: Record<string, string> = {
  // North American Pro & Junior Pipeline
  ahl: 'ahl',
  echl: 'echl',
  ohl: 'ohl',
  whl: 'whl',
  qmjhl: 'qmjhl',

  // NCAA & U.S. Junior
  ncaa: 'ncaa',
  ushl: 'ushl',
  nahl: 'nahl',

  // European Pro Leagues
  shl: 'shl',
  liiga: 'liiga',
  khl: 'khl',
  nl: 'nla',             // Swiss National League
  del: 'del',
  elh: 'czech-extraliga',

  // European & International Development
  j20: 'j20-nationell',
  mhl: 'mhl',
  usntdp: 'usntdp',
  bchl: 'bchl',
};

/**
 * Build the URL for a league's stats page on Elite Prospects.
 * EP format: https://www.eliteprospects.com/league/{slug}/stats/{season}
 */
export function getEPStatsUrl(slug: string, season: string): string {
  return `https://www.eliteprospects.com/league/${slug}/stats/${season}`;
}

/**
 * Build the URL for a specific player's page on Elite Prospects.
 */
export function getEPPlayerUrl(epId: string, slug: string): string {
  return `https://www.eliteprospects.com/player/${epId}/${slug}`;
}
