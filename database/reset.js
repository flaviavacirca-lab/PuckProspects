/**
 * Database reset script.
 * Drops all tables and re-runs migrations + seed.
 *
 * Usage: node database/reset.js
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');

async function reset() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://puckprospects:puckprospects@localhost:5432/puckprospects';
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('Dropping all tables...');
    await pool.query(`
      DROP TABLE IF EXISTS watchlist CASCADE;
      DROP TABLE IF EXISTS stat_snapshots CASCADE;
      DROP TABLE IF EXISTS league_averages CASCADE;
      DROP TABLE IF EXISTS ingestion_log CASCADE;
      DROP TABLE IF EXISTS goalie_stats CASCADE;
      DROP TABLE IF EXISTS player_stats CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
      DROP TABLE IF EXISTS teams CASCADE;
      DROP TABLE IF EXISTS leagues CASCADE;
    `);
    console.log('Tables dropped.');
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }

  // Re-run migrations and seed
  console.log('Running migrations...');
  execSync('node database/migrate.js', { stdio: 'inherit' });
  console.log('Running seed...');
  execSync('node database/seed.js', { stdio: 'inherit' });
  console.log('Reset complete.');
}

reset();
