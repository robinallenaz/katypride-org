/**
 * One-time migration: copy data/site-images.json rows into Neon Postgres.
 *
 * Run:
 *   node scripts/migrate-site-images.mjs
 *
 * Prerequisites:
 * 1) DATABASE_URL in .env.local (or process env)
 * 2) data/site-images.json exists
 */

import { promises as fs } from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function ensureSiteImagesTableExists(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS site_images (
      image_key VARCHAR(120) PRIMARY KEY,
      id VARCHAR(120) NOT NULL,
      url TEXT NOT NULL,
      alt TEXT NOT NULL,
      caption TEXT,
      updated_at TIMESTAMPTZ,
      cloudinary_public_id TEXT,
      gravity VARCHAR(32),
      focal_x DOUBLE PRECISION,
      focal_y DOUBLE PRECISION,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function normalizeImage(raw) {
  const key = String(raw?.key || '').trim();
  const id = String(raw?.id || key).trim();
  const url = typeof raw?.url === 'string' ? raw.url.trim() : '';
  const alt = typeof raw?.alt === 'string' ? raw.alt.trim() : 'Image';

  if (!key || !id || !url) {
    return null;
  }

  const parsedUpdatedAt = raw?.updatedAt ? new Date(raw.updatedAt) : null;
  const updatedAt = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
    ? parsedUpdatedAt.toISOString()
    : null;

  return {
    key,
    id,
    url,
    alt,
    caption: raw?.caption ? String(raw.caption).trim() : null,
    updatedAt,
    cloudinaryPublicId: raw?.cloudinaryPublicId ? String(raw.cloudinaryPublicId).trim() : null,
    gravity: raw?.gravity ? String(raw.gravity).trim() : 'auto',
    focalX: raw?.focalX ?? null,
    focalY: raw?.focalY ?? null,
  };
}

async function migrateSiteImages() {
  const jsonPath = path.join(process.cwd(), 'data', 'site-images.json');
  console.log(`📖 Reading ${jsonPath}...`);

  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const images = Array.isArray(parsed?.images) ? parsed.images : [];

  if (images.length === 0) {
    console.log('ℹ️ No images found in data/site-images.json');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureSiteImagesTableExists(client);

    let migrated = 0;
    let skipped = 0;

    for (const rawImage of images) {
      const image = normalizeImage(rawImage);
      if (!image) {
        skipped += 1;
        continue;
      }

      await client.query(
        `INSERT INTO site_images (
          image_key, id, url, alt, caption, updated_at,
          cloudinary_public_id, gravity, focal_x, focal_y
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (image_key) DO UPDATE SET
          id = EXCLUDED.id,
          url = EXCLUDED.url,
          alt = EXCLUDED.alt,
          caption = EXCLUDED.caption,
          updated_at = EXCLUDED.updated_at,
          cloudinary_public_id = EXCLUDED.cloudinary_public_id,
          gravity = EXCLUDED.gravity,
          focal_x = EXCLUDED.focal_x,
          focal_y = EXCLUDED.focal_y`,
        [
          image.key,
          image.id,
          image.url,
          image.alt,
          image.caption,
          image.updatedAt,
          image.cloudinaryPublicId,
          image.gravity,
          image.focalX,
          image.focalY,
        ]
      );

      migrated += 1;
      console.log(`  ✓ ${image.key}`);
    }

    await client.query('COMMIT');

    console.log('\n✅ Site images migration complete!');
    console.log(`   - Migrated: ${migrated}`);
    console.log(`   - Skipped:  ${skipped}`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw error;
  } finally {
    client.release();
  }
}

migrateSiteImages()
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
