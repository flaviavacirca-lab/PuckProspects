/**
 * Database migration script.
 * Reads schema.sql and executes it against the configured PostgreSQL database.
 *
 * Usage: node database/migrate.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://puckprospects:puckprospects@localhost:5432/puckprospects';
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('Running migrations...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
