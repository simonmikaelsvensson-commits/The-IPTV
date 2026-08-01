const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set. Set env var and rerun: DATABASE_URL="postgresql://user:pass@host:5432/db" node run_migrations.js');
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const file of files) {
      console.log('Applying', file);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log('Applied', file);
    }
    console.log('All migrations applied.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run();
