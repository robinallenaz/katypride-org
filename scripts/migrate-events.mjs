/**
 * Migration script: Move events from JSON to PostgreSQL
 * 
 * Run: node scripts/migrate-events.mjs
 * 
 * Prerequisites:
 * 1. DATABASE_URL in .env.local
 * 2. Events table created in Neon
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  console.log('🚀 Starting event migration...\n');

  try {
    // Read events from JSON
    const dataDir = path.join(process.cwd(), 'data');
    const eventsFile = path.join(dataDir, 'events.json');
    
    console.log(`📖 Reading events from ${eventsFile}...`);
    const data = await fs.readFile(eventsFile, 'utf8');
    const { events } = JSON.parse(data);
    
    console.log(`✅ Found ${events.length} events\n`);

    // Get database client
    const client = await pool.connect();
    
    try {
      console.log('📝 Inserting events into database...');
      
      await client.query('BEGIN');
      
      let inserted = 0;
      let updated = 0;
      
      for (const event of events) {
        const id = parseInt(event.id);
        if (isNaN(id)) {
          console.warn(`  ⚠️ Skipping event with invalid ID: ${event.title} (ID: ${event.id})`);
          continue;
        }
        const parentId = event.parentId ? parseInt(event.parentId) : null;
        if (event.parentId && isNaN(parentId)) {
          console.warn(`  ⚠️ Skipping event with invalid parentId: ${event.title} (parentId: ${event.parentId})`);
          continue;
        }
        const result = await client.query(
          `INSERT INTO events (
            id, title, start, "end", location, image_src, image_alt,
            event_category, external_url, external_cta_label, summary,
            is_recurring, parent_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            start = EXCLUDED.start,
            "end" = EXCLUDED.end,
            location = EXCLUDED.location,
            image_src = EXCLUDED.image_src,
            image_alt = EXCLUDED.image_alt,
            event_category = EXCLUDED.event_category,
            external_url = EXCLUDED.external_url,
            external_cta_label = EXCLUDED.external_cta_label,
            summary = EXCLUDED.summary,
            is_recurring = EXCLUDED.is_recurring,
            parent_id = EXCLUDED.parent_id
          RETURNING (xmax = 0) as inserted`,
          [
            id,
            event.title,
            event.start,
            event.end || null,
            event.location || null,
            event.imageSrc || null,
            event.imageAlt,
            event.eventCategory,
            event.externalUrl || null,
            event.externalCtaLabel || null,
            event.summary || null,
            event.isRecurring || false,
            parentId,
          ]
        );
        
        if (result.rows[0].inserted) {
          inserted++;
        } else {
          updated++;
        }
        
        console.log(`  ✓ ${event.title}`);
      }
      
      await client.query('COMMIT');
      
      // Update sequence to match highest ID (fixes SERIAL auto-increment after migration)
      // Note: Sequence updates are NOT transactional - they persist even if transaction rolls back
      // We run this AFTER commit to avoid sequence corruption on rollback
      await client.query(`SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0), false)`);
      
      console.log('   - Updated events_id_seq sequence');
      console.log(`\n✅ Migration complete!`);
      console.log(`   - Inserted: ${inserted} events`);
      console.log(`   - Updated: ${updated} events`);
      console.log(`   - Total: ${events.length} events\n`);
      
    } catch (error) {
      // Rollback only if we're still in a transaction (not already committed/rolled back)
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        // Ignore rollback errors (transaction may already be closed)
      }
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Ensure pool cleanup happens even if validation errors occur before migrate() runs
migrate().finally(async () => {
  await pool.end();
});
