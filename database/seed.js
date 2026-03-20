/**
 * Database seed script.
 * Populates the database with league registry data and sample players.
 *
 * Usage: node database/seed.js
 */

const { Pool } = require('pg');

const LEAGUES = [
  { code: 'ahl',   name: 'American Hockey League',                short_name: 'AHL',   country: 'USA/Canada', level: 'pro',     tier: 1, source_url: 'https://theahl.com/stats' },
  { code: 'echl',  name: 'ECHL',                                  short_name: 'ECHL',  country: 'USA/Canada', level: 'pro',     tier: 2, source_url: 'https://echl.com/stats' },
  { code: 'ohl',   name: 'Ontario Hockey League',                  short_name: 'OHL',   country: 'Canada',     level: 'junior',  tier: 1, source_url: 'https://ontariohockeyleague.com/stats' },
  { code: 'whl',   name: 'Western Hockey League',                  short_name: 'WHL',   country: 'Canada',     level: 'junior',  tier: 1, source_url: 'https://whl.ca/stats' },
  { code: 'qmjhl', name: 'Quebec Major Junior Hockey League',      short_name: 'QMJHL', country: 'Canada',     level: 'junior',  tier: 1, source_url: 'https://theqmjhl.ca/stats' },
  { code: 'ncaa',  name: "NCAA Division I Men's Ice Hockey",       short_name: 'NCAA',  country: 'USA',        level: 'college', tier: 1, source_url: 'https://www.ncaa.com/stats/icehockey-men/d1' },
  { code: 'ushl',  name: 'United States Hockey League',            short_name: 'USHL',  country: 'USA',        level: 'junior',  tier: 1, source_url: 'https://ushl.com/stats' },
  { code: 'nahl',  name: 'North American Hockey League',           short_name: 'NAHL',  country: 'USA',        level: 'junior',  tier: 2, source_url: 'https://nahl.com/stats' },
  { code: 'shl',   name: 'Swedish Hockey League',                  short_name: 'SHL',   country: 'Sweden',     level: 'pro',     tier: 1, source_url: 'https://www.shl.se/statistik' },
  { code: 'j20',   name: 'J20 Nationell',                          short_name: 'J20',   country: 'Sweden',     level: 'u20',     tier: 2, source_url: 'https://stats.swehockey.se/' },
  { code: 'liiga', name: 'Liiga',                                  short_name: 'Liiga', country: 'Finland',    level: 'pro',     tier: 1, source_url: 'https://liiga.fi/en/statistics' },
  { code: 'khl',   name: 'Kontinental Hockey League',              short_name: 'KHL',   country: 'Russia',     level: 'pro',     tier: 1, source_url: 'https://en.khl.ru/stat/' },
  { code: 'mhl',   name: 'MHL',                                    short_name: 'MHL',   country: 'Russia',     level: 'u20',     tier: 2, source_url: 'https://mhl.khl.ru/stat/' },
  { code: 'nl',    name: 'National League',                        short_name: 'NL',    country: 'Switzerland',level: 'pro',     tier: 1, source_url: 'https://www.sihf.ch/en/game-center/national-league/#/statistics' },
  { code: 'del',   name: 'Deutsche Eishockey Liga',                short_name: 'DEL',   country: 'Germany',    level: 'pro',     tier: 1, source_url: 'https://www.penny-del.org/statistik' },
  { code: 'elh',   name: 'Czech Extraliga',                        short_name: 'ELH',   country: 'Czech Republic', level: 'pro', tier: 1, source_url: 'https://www.hokej.cz/statistiky' },
  { code: 'usntdp',name: 'USA Hockey NTDP',                        short_name: 'NTDP',  country: 'USA',        level: 'development', tier: 1, source_url: 'https://www.usahockeyntdp.com/stats' },
  { code: 'bchl',  name: 'British Columbia Hockey League',          short_name: 'BCHL',  country: 'Canada',     level: 'junior',  tier: 2, source_url: 'https://bchl.ca/stats' },
  { code: 'hockey_canada', name: 'Hockey Canada Programs',         short_name: 'HC',    country: 'Canada',     level: 'development', tier: 2, source_url: 'https://www.hockeycanada.ca/en-ca' },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://puckprospects:puckprospects@localhost:5432/puckprospects';
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('Seeding leagues...');
    for (const league of LEAGUES) {
      await pool.query(
        `INSERT INTO leagues (code, name, short_name, country, level, tier, source_url, connector_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'placeholder')
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           source_url = EXCLUDED.source_url,
           updated_at = NOW()`,
        [league.code, league.name, league.short_name, league.country, league.level, league.tier, league.source_url]
      );
    }
    console.log(`Seeded ${LEAGUES.length} leagues.`);

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
