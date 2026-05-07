/**
 * Migration script: Move form-backup submissions from JSON to PostgreSQL
 *
 * Run: node scripts/migrate-form-submissions.mjs
 *
 * Prerequisites:
 * 1. DATABASE_URL in .env.local
 * 2. form_submissions table already exists (or will be created by this script)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('   Create .env.local with: DATABASE_URL=postgresql://...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log('🚀 Starting form submissions migration...\n');

  const dataDir = path.join(process.cwd(), 'data');
  const backupFile = path.join(dataDir, 'form-backup.json');

  let submissions = [];
  try {
    const data = await fs.readFile(backupFile, 'utf8');
    const parsed = JSON.parse(data);
    submissions = Array.isArray(parsed.submissions) ? parsed.submissions : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`   ℹ️ No form-backup.json found at ${backupFile}; nothing to migrate.`);
      return;
    }
    throw error;
  }

  if (submissions.length === 0) {
    console.log('   ℹ️ form-backup.json contains no submissions; nothing to migrate.\n');
    return;
  }

  console.log(`📖 Read ${submissions.length} submission(s) from ${backupFile}\n`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure table and indexes exist (idempotent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(50),
        name VARCHAR(255),
        email VARCHAR(255),
        data JSONB NOT NULL DEFAULT '{}',
        crm_success BOOLEAN DEFAULT FALSE
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_timestamp ON form_submissions(timestamp DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(type)
    `);

    let inserted = 0;
    let skipped = 0;

    for (const sub of submissions) {
      const ts = sub.timestamp ? new Date(sub.timestamp) : new Date();
      const name = sub.name || null;
      const email = sub.email || null;
      const type = sub.type || null;
      const crmSuccess = sub.crmSuccess === true || sub.crm_success === true;

      // Deduplicate by email + timestamp (±1 second) to avoid inserting exact
      // duplicates if this script is run more than once.
      const dupCheck = await client.query(
        `SELECT 1 FROM form_submissions
         WHERE email = $1
           AND timestamp BETWEEN $2 AND $3
         LIMIT 1`,
        [email, new Date(ts.getTime() - 1000), new Date(ts.getTime() + 1000)]
      );
      if (dupCheck.rows.length > 0) {
        console.log(`  ⏭ Skipped (duplicate): ${name || email || '(no name)'} @ ${ts.toISOString()}`);
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO form_submissions (timestamp, type, name, email, data, crm_success)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
        [ts, type, name, email, JSON.stringify(sub), crmSuccess]
      );
      inserted++;
      console.log(`  ✓ ${name || email || '(no name)'} @ ${ts.toISOString()}`);
    }

    await client.query('COMMIT');

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Inserted: ${inserted} submission(s)`);
    console.log(`   - Skipped (duplicates): ${skipped} submission(s)`);
    console.log(`   - Total in JSON: ${submissions.length}\n`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore
    }
    throw error;
  } finally {
    client.release();
  }
}

migrate().finally(async () => {
  await pool.end();
});
