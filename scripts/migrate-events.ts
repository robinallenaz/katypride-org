/**
 * Migration script: Move events from JSON to PostgreSQL
 * 
 * Run this after:
 * 1. Setting up the events table in Neon (see scripts/create-events-table.sql)
 * 2. Adding DATABASE_URL to your environment
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." npx ts-node scripts/migrate-events.ts
 * 
 * Or run manually in your dev environment:
 *   npx ts-node scripts/migrate-events.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  imageSrc?: string;
  imageAlt: string;
  eventCategory: string;
  externalUrl?: string;
  externalCtaLabel?: string;
  summary?: string;
  isRecurring?: boolean;
  parentId?: string;
}

async function migrate() {
  console.log('🚀 Starting event migration...\n');

  try {
    // Read events from JSON
    const dataDir = path.join(process.cwd(), 'data');
    const eventsFile = path.join(dataDir, 'events.json');
    
    console.log(`📖 Reading events from ${eventsFile}...`);
    const data = await fs.readFile(eventsFile, 'utf8');
    const { events } = JSON.parse(data) as { events: Event[] };
    
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
          throw new Error(`Invalid numeric ID for event: ${event.title} (ID: ${event.id})`);
        }
        const parentId = event.parentId ? parseInt(event.parentId) : null;
        if (event.parentId && isNaN(parentId!)) {
          throw new Error(`Invalid numeric parentId for event: ${event.title} (parentId: ${event.parentId})`);
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
      
      console.log(`\n✅ Migration complete!`);
      console.log(`   - Inserted: ${inserted} events`);
      console.log(`   - Updated: ${updated} events`);
      console.log(`   - Total: ${events.length} events\n`);
      
    } catch (error) {
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
  } finally {
    await pool.end();
  }
}

migrate();
