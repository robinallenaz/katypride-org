import { promises as fs } from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';

// PostgreSQL connection for events
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Limit connections for serverless environments
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Timeout new connections after 5s
    })
  : null;

// Log connection status
if (pool) {
  console.log('[DataService] PostgreSQL pool initialized for events and site-images');
} else {
  console.log('[DataService] No DATABASE_URL, content will use JSON fallback');
}

async function upsertSiteImageToDb(image: SiteImage): Promise<void> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId('site_images');

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureSiteImagesTableExists(client);

    const key = String(image.key || '').trim();
    const id = String(image.id || '').trim();

    if (!key || !id) {
      throw new Error('Site image key and id are required');
    }

    await client.query(
      `INSERT INTO site_images (
        image_key, id, url, alt, caption, updated_at,
        cloudinary_public_id, gravity, focal_x, focal_y
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        key,
        id,
        image.url,
        image.alt,
        image.caption || null,
        image.updatedAt || null,
        image.cloudinaryPublicId || null,
        image.gravity || 'auto',
        image.focalX ?? null,
        image.focalY ?? null,
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

async function deleteSiteImageByKeyInDb(key: string): Promise<void> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId('site_images');

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureSiteImagesTableExists(client);
    await client.query('DELETE FROM site_images WHERE image_key = $1', [key]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

// Primary data directory (committed files)
const primaryDataDir = path.join(process.cwd(), 'data');

// Writable directory for serverless environments
const isServerless = process.env.VERCEL || process.env.RENDER || process.env.AWS_LAMBDA_FUNCTION_NAME;
const writableDataDir = isServerless 
  ? path.join('/tmp', 'data')
  : primaryDataDir;

// Ensure writable directory exists on module load
(async () => {
  try {
    await fs.access(writableDataDir);
  } catch {
    try {
      await fs.mkdir(writableDataDir, { recursive: true });
    } catch (error) {
      console.error(`[DataService] Failed to create data directory: ${writableDataDir}`, error);
    }
  }
})();

// File locking to prevent race conditions
const fileLocks = new Map<string, Promise<void>>();
const LOCK_TIMEOUT_MS = 5000; // 5 second timeout

async function acquireLock(filePath: string): Promise<() => void> {
  const startTime = Date.now();
  
  while (fileLocks.has(filePath)) {
    // Wait for existing lock with timeout
    await Promise.race([
      fileLocks.get(filePath)!,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File lock timeout')), LOCK_TIMEOUT_MS)
      )
    ]).catch(() => {
      // If timeout, force release the stuck lock
      fileLocks.delete(filePath);
    });
    
    // Safety check: if we've been waiting too long, break
    if (Date.now() - startTime > LOCK_TIMEOUT_MS * 2) {
      fileLocks.delete(filePath);
      break;
    }
    
    // Small delay to prevent CPU spinning between attempts
    await new Promise(r => setTimeout(r, 10));
  }
  
  let release: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    release = () => {
      fileLocks.delete(filePath);
      resolve();
    };
  });
  
  fileLocks.set(filePath, lockPromise);
  return release;
}

// Database helper to get a client from the pool
async function getDbClient(): Promise<PoolClient | null> {
  if (!pool) return null;
  try {
    return await pool.connect();
  } catch (error) {
    console.error('[DataService] Failed to get database client:', error);
    return null;
  }
}

interface EventRow {
  id: string | number;
  title: string;
  start: string;
  end: string | null;
  location: string | null;
  image_src: string | null;
  image_alt: string;
  event_category: Event['eventCategory'];
  external_url: string | null;
  external_cta_label: string | null;
  summary: string | null;
  is_recurring: boolean | null;
  parent_id: string | number | null;
}

interface SiteImageRow {
  id: string;
  image_key: string;
  url: string;
  alt: string;
  caption: string | null;
  updated_at: string | Date | null;
  cloudinary_public_id: string | null;
  gravity: SiteImage['gravity'] | null;
  focal_x: number | null;
  focal_y: number | null;
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error;
}

// Convert database row to Event type
function rowToEvent(row: EventRow): Event {
  return {
    id: String(row.id),
    title: row.title,
    start: row.start,
    end: row.end ?? undefined,
    location: row.location ?? undefined,
    imageSrc: row.image_src ?? undefined,
    imageAlt: row.image_alt,
    eventCategory: row.event_category,
    externalUrl: row.external_url ?? undefined,
    externalCtaLabel: row.external_cta_label ?? undefined,
    summary: row.summary ?? undefined,
    isRecurring: row.is_recurring ?? undefined,
    parentId: row.parent_id ? String(row.parent_id) : undefined,
  };
}

function rowToSiteImage(row: SiteImageRow): SiteImage {
  return {
    id: String(row.id),
    key: String(row.image_key),
    url: row.url,
    alt: row.alt,
    caption: row.caption || undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    cloudinaryPublicId: row.cloudinary_public_id || undefined,
    gravity: row.gravity || 'auto',
    focalX: row.focal_x ?? undefined,
    focalY: row.focal_y ?? undefined,
  };
}

function mergeSiteImagesByKey(existing: SiteImage[], incoming: SiteImage[]): SiteImage[] {
  const merged = new Map<string, SiteImage>();

  for (const image of existing) {
    const key = String(image?.key || '').trim();
    if (!key) continue;
    merged.set(key, image);
  }

  for (const image of incoming) {
    const key = String(image?.key || '').trim();
    if (!key) continue;
    merged.set(key, image);
  }

  return Array.from(merged.values());
}

async function ensureSiteImagesTableExists(client: PoolClient): Promise<void> {
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

async function ensurePaymentVerificationsTableExists(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS payment_verifications (
      payment_intent_id VARCHAR(255) PRIMARY KEY,
      first_verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      verified_count INTEGER DEFAULT 1
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_payment_verifications_first_verified ON payment_verifications(first_verified_at)
  `);
}

async function ensureRateLimitTableExists(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      identifier VARCHAR(255) PRIMARY KEY,
      request_count INTEGER NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start)
  `);
}

async function ensureEventsTableExists(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      start TIMESTAMPTZ NOT NULL,
      "end" TIMESTAMPTZ,
      location VARCHAR(500),
      image_src VARCHAR(500),
      image_alt VARCHAR(255) NOT NULL,
      event_category VARCHAR(50) NOT NULL CHECK (event_category IN (
        'general', 'coffee', 'social', 'fundraising', 'advocacy',
        'education', 'health', 'youth', 'pride', 'volunteer', 'cultural', 'community'
      )),
      external_url VARCHAR(500),
      external_cta_label VARCHAR(100),
      summary TEXT,
      is_recurring BOOLEAN DEFAULT FALSE,
      parent_id INTEGER REFERENCES events(id),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_events_start ON events(start)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(event_category)
  `);
}

async function readSiteImagesFromDb(): Promise<{ images: SiteImage[] }> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  try {
    await ensureSiteImagesTableExists(client);
    const result = await client.query(
      `SELECT id, image_key, url, alt, caption, updated_at, cloudinary_public_id, gravity, focal_x, focal_y
       FROM site_images
       ORDER BY image_key ASC`
    );
    return { images: result.rows.map((row) => rowToSiteImage(row as SiteImageRow)) };
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      console.error('[DataService] Error releasing client:', releaseError);
    }
  }
}

async function writeSiteImagesToDb(images: SiteImage[]): Promise<void> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId('site_images');

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureSiteImagesTableExists(client);

    for (const image of images) {
      if (!image?.key || !image?.id) {
        console.warn('[DataService] Skipping site image with missing key/id');
        continue;
      }

      const key = String(image.key).trim();
      const id = String(image.id).trim();
      if (!key || !id) {
        console.warn('[DataService] Skipping site image with blank key/id');
        continue;
      }

      await client.query(
        `INSERT INTO site_images (
          image_key, id, url, alt, caption, updated_at,
          cloudinary_public_id, gravity, focal_x, focal_y
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
          key,
          id,
          image.url,
          image.alt,
          image.caption || null,
          image.updatedAt || null,
          image.cloudinaryPublicId || null,
          image.gravity || 'auto',
          image.focalX ?? null,
          image.focalY ?? null,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Generic app_config (key/JSONB) storage. Used for small JSON configs that
// admins edit via /admin (e.g. coffee meetup config). Persisting to Postgres
// instead of /tmp is required on serverless hosts where /tmp is ephemeral.
// ---------------------------------------------------------------------------

async function ensureAppConfigTableExists(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_config (
      config_key VARCHAR(120) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function readAppConfigFromDb<T>(key: string): Promise<T | null> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }
  try {
    await ensureAppConfigTableExists(client);
    const result = await client.query(
      'SELECT value FROM app_config WHERE config_key = $1 LIMIT 1',
      [key]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].value as T;
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      console.error('[DataService] Error releasing client:', releaseError);
    }
  }
}

async function writeAppConfigToDb<T>(key: string, value: T): Promise<void> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId(`app_config:${key}`);

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureAppConfigTableExists(client);

    await client.query(
      `INSERT INTO app_config (config_key, value, updated_at)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (config_key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value)]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

// Filenames that should be persisted via the generic app_config table.
const APP_CONFIG_KEYS = new Set<string>(['coffee-meetup-config']);

// Read events from PostgreSQL database
async function readEventsFromDb(): Promise<{ events: Event[] }> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  try {
    await ensureEventsTableExists(client);
    const result = await client.query(
      'SELECT * FROM events ORDER BY start ASC'
    );
    return { events: result.rows.map((row) => rowToEvent(row as EventRow)) };
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      console.error('[DataService] Error releasing client:', releaseError);
    }
  }
}

// Generate a consistent lock ID based on table name to avoid collisions
// but allow different tables to use different locks
function getTableLockId(tableName: string): number {
  // Simple hash: sum of char codes mod 2^31 to stay within PostgreSQL bigint range
  let hash = 0;
  for (let i = 0; i < tableName.length; i++) {
    hash = ((hash << 5) - hash) + tableName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) || 1; // Ensure non-zero
}

// Record a payment verification and return whether it's within the valid window
export async function recordPaymentVerification(paymentIntentId: string): Promise<{ valid: boolean; error?: string }> {
  if (!pool) {
    // Security: Require explicit opt-in to allow payment verification without database
    const allowWithoutDb = process.env.ALLOW_PAYMENT_VERIFICATION_WITHOUT_DB === 'true';
    if (!allowWithoutDb) {
      console.error('[DataService] Payment verification requires database connection');
      return { valid: false, error: 'Database connection required for payment verification' };
    }
    // Dev mode fallback - only if explicitly enabled
    console.warn('[DataService] No database for payment verification, allowing (ALLOW_PAYMENT_VERIFICATION_WITHOUT_DB=true)');
    return { valid: true };
  }

  const client = await getDbClient();
  if (!client) {
    return { valid: false, error: 'Database not available' };
  }

  try {
    await client.query('BEGIN');

    await ensurePaymentVerificationsTableExists(client);

    // Check if this payment intent was already verified
    const existingResult = await client.query(
      'SELECT first_verified_at, verified_count FROM payment_verifications WHERE payment_intent_id = $1',
      [paymentIntentId]
    );

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      const firstVerifiedAt = new Date(existing.first_verified_at);

      // If first verification was more than 1 hour ago, reject
      if (firstVerifiedAt <= oneHourAgo) {
        await client.query('COMMIT');
        return { valid: false, error: 'Verification link has expired' };
      }

      // Increment verification count
      await client.query(
        'UPDATE payment_verifications SET verified_count = verified_count + 1 WHERE payment_intent_id = $1',
        [paymentIntentId]
      );

      await client.query('COMMIT');
      return { valid: true };
    } else {
      // First verification - record it
      // PRIMARY KEY constraint prevents concurrent duplicate inserts
      await client.query(
        'INSERT INTO payment_verifications (payment_intent_id) VALUES ($1)',
        [paymentIntentId]
      );

      await client.query('COMMIT');
      return { valid: true };
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[DataService] Error recording payment verification:', error);
    return { valid: false, error: 'Failed to record verification' };
  } finally {
    client.release();
  }
}

// Check rate limit for a given identifier (e.g., IP address)
// Returns { allowed: boolean } and logs when limit is exceeded
export async function checkRateLimit(identifier: string, maxRequests: number, windowMinutes: number): Promise<{ allowed: boolean; error?: string }> {
  if (!pool) {
    // If no database, allow all requests (dev mode)
    console.warn('[DataService] No database for rate limiting, allowing all requests');
    return { allowed: true };
  }

  const client = await getDbClient();
  if (!client) {
    return { allowed: false, error: 'Database not available' };
  }

  try {
    await client.query('BEGIN');
    await ensureRateLimitTableExists(client);

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    // Clean up old entries to prevent table bloat
    await client.query('DELETE FROM rate_limits WHERE window_start < $1', [windowStart]);

    // Check existing entry for this identifier
    const existingResult = await client.query(
      'SELECT request_count, window_start FROM rate_limits WHERE identifier = $1',
      [identifier]
    );

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      const entryWindowStart = new Date(existing.window_start);

      // If entry is outside the current window, reset it
      if (entryWindowStart < windowStart) {
        await client.query(
          'UPDATE rate_limits SET request_count = 1, window_start = $1 WHERE identifier = $2',
          [now, identifier]
        );
        await client.query('COMMIT');
        return { allowed: true };
      }

      // Check if limit exceeded
      if (existing.request_count >= maxRequests) {
        await client.query('COMMIT');
        console.warn(`[RateLimit] Identifier ${identifier} exceeded rate limit (${existing.request_count}/${maxRequests})`);
        return { allowed: false, error: 'Rate limit exceeded' };
      }

      // Increment count
      await client.query(
        'UPDATE rate_limits SET request_count = request_count + 1 WHERE identifier = $1',
        [identifier]
      );
      await client.query('COMMIT');
      return { allowed: true };
    } else {
      // First request from this identifier
      await client.query(
        'INSERT INTO rate_limits (identifier, request_count, window_start) VALUES ($1, 1, $2)',
        [identifier, now]
      );
      await client.query('COMMIT');
      return { allowed: true };
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[DataService] Error checking rate limit:', error);
    // On error, allow the request to avoid blocking legitimate traffic
    // This is a safe default - better to allow a potential abuse than block legitimate users
    return { allowed: true };
  } finally {
    client.release();
  }
}

// Insert a single new event into PostgreSQL, letting SERIAL assign the id.
// Returns the inserted event with its newly assigned id.
async function insertEventToDb(event: Event): Promise<Event> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId('events');

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureEventsTableExists(client);
    const parentId = event.parentId ? parseInt(event.parentId, 10) : null;
    const result = await client.query(
      `INSERT INTO events (
        title, start, "end", location, image_src, image_alt,
        event_category, external_url, external_cta_label, summary,
        is_recurring, parent_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
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
        parentId && !isNaN(parentId) ? parentId : null,
      ]
    );

    await client.query('COMMIT');
    return rowToEvent(result.rows[0] as EventRow);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

// Public helper: insert a new event. Falls back to rewrite-all path when no DB
// is configured (local JSON dev mode).
export async function createEvent(event: Omit<Event, 'id'> & { id?: string }): Promise<Event> {
  if (pool) {
    return await insertEventToDb(event as Event);
  }
  // JSON fallback (dev): generate a string id and append
  const data = await readData<{ events: Event[] }>('events');
  const newEvent: Event = { ...(event as Event), id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  data.events.push(newEvent);
  await writeData('events', data);
  return newEvent;
}

// Write events to PostgreSQL database using advisory lock for concurrency safety
async function writeEventsToDb(events: Event[]): Promise<void> {
  const client = await getDbClient();
  if (!client) {
    throw new Error('Database not available');
  }

  let lockAcquired = false;
  const lockId = getTableLockId('events'); // Generate lock ID from table name

  try {
    await client.query('BEGIN');

    // Acquire advisory lock to prevent race conditions in serverless environments
    await client.query('SELECT pg_advisory_lock($1)', [lockId]);
    lockAcquired = true;

    await ensureEventsTableExists(client);

    // Safety check: prevent destructive operations if events array is suspiciously small
    // This protects against accidental data loss from partial writes
    const currentCountResult = await client.query('SELECT COUNT(*) as count FROM events');
    const currentCount = parseInt(currentCountResult.rows[0].count, 10);

    // If we're about to delete more than 50% of events, require minimum threshold
    const incomingIds = events.map(e => {
      const id = parseInt(e.id, 10);
      return isNaN(id) ? null : id;
    }).filter((id): id is number => id !== null);

    // Count all incoming events (both numeric-ID and string-ID) since all will be kept
    const keepingCount = events.length;
    const wouldDelete = currentCount - keepingCount;
    const deleteRatio = currentCount > 0 ? wouldDelete / currentCount : 0;

    // Safety valve: if we'd delete >50% of events and have >5 events, abort
    if (deleteRatio > 0.5 && currentCount > 5) {
      throw new Error(
        `Safety check failed: Attempting to delete ${wouldDelete} of ${currentCount} events ` +
        `(${Math.round(deleteRatio * 100)}%). This looks like an accidental partial write. ` +
        `If intentional, delete and recreate with smaller batches.`
      );
    }

    // Additional safety: prevent deleting all events when incoming are all string-IDs
    // unless the DB is empty or has very few events (migration scenario)
    if (incomingIds.length === 0 && events.length > 0 && currentCount > 3) {
      throw new Error(
        `Safety check failed: Attempting to delete all ${currentCount} events and replace ` +
        `with ${events.length} string-ID events. This would cause data loss. ` +
        `If migrating from JSON to DB, first ensure the DB is empty or use a migration script.`
      );
    }

    // Delete events that are no longer in the list (orphaned records)
    if (incomingIds.length > 0) {
      await client.query(
        'DELETE FROM events WHERE id <> ALL($1::int[])',
        [incomingIds]
      );
    } else if (events.length > 0) {
      // All incoming events have string IDs (JSON fallback mode).
      // Since this is a full sync, clear existing rows to avoid duplicates.
      await client.query('DELETE FROM events');
    }
    // Note: If events.length === 0, we don't delete anything to prevent accidental
    // data loss from an empty payload.

    // Upsert each event individually
    for (const event of events) {
      let parentId = event.parentId ? parseInt(event.parentId, 10) : null;
      if (event.parentId && isNaN(parentId!)) {
        console.warn(`[DataService] Event "${event.title}" has invalid parentId "${event.parentId}", treating as no parent`);
        // Set parentId to null instead of skipping the event entirely
        parentId = null;
      }

      const eventId = parseInt(event.id, 10);
      const hasNumericId = !isNaN(eventId);

      if (hasNumericId) {
        await client.query(
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
            parent_id = EXCLUDED.parent_id,
            updated_at = CURRENT_TIMESTAMP`,
          [
            eventId,
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
      } else {
        // String IDs (JSON fallback mode) get inserted without explicit id
        // so SERIAL assigns a new one.
        await client.query(
          `INSERT INTO events (
            title, start, "end", location, image_src, image_alt,
            event_category, external_url, external_cta_label, summary,
            is_recurring, parent_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
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
      }
    }

    // Sync the sequence to the current max id so the next SERIAL insert
    // (insertEventToDb) gets max+1 and never collides with an existing row.
    // is_called=true means "this value is already used; next nextval = max+1".
    // Use is_called=false when table is empty so first insert gets id=1.
    const maxIdResult = await client.query('SELECT COALESCE((SELECT MAX(id) FROM events), 0) as max_id');
    const maxId = parseInt(maxIdResult.rows[0].max_id, 10);
    await client.query(`SELECT setval('events_id_seq', $1, $2)`, [maxId > 0 ? maxId : 1, maxId > 0]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    // Release advisory lock if acquired
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [lockId]).catch(() => {});
    }
    client.release();
  }
}

// Read data from JSON file or PostgreSQL for events
export async function readData<T>(filename: string): Promise<T> {
  // Use database for events if available
  if (filename === 'events' && pool) {
    try {
      return await readEventsFromDb() as unknown as T;
    } catch (error) {
      console.warn('[DataService] Failed to read events from DB, falling back to JSON:', error);
      // Fall through to JSON fallback
    }
  }

  // Use database for app_config-backed files if available.
  // On DB miss (no row yet), fall back to the committed JSON seed so a fresh
  // database still serves a sensible default. On DB error, surface it.
  if (APP_CONFIG_KEYS.has(filename) && pool) {
    try {
      const value = await readAppConfigFromDb<T>(filename);
      if (value !== null) return value;
      // Fall through to JSON seed below if no row yet.
    } catch (error) {
      console.error(`[DataService] Failed to read app_config "${filename}" from DB:`, error);
      // Fall through to JSON so the public site keeps rendering.
    }
  }

  // Use database for site-images if available.
  // Do not fall back to JSON on DB read errors, because that can serve stale
  // content (e.g. deleted images reappearing from old JSON snapshots).
  if (filename === 'site-images' && pool) {
    try {
      const dbData = await readSiteImagesFromDb();
      return dbData as unknown as T;
    } catch (error) {
      console.error('[DataService] CRITICAL: Failed to read site-images from DB:', error);
      throw new Error(
        `Failed to read site-images from database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent stale content and data inconsistency.'
      );
    }
  }

  // Try writable directory first (for admin changes on serverless)
  const writablePath = path.join(writableDataDir, `${filename}.json`);
  const release = await acquireLock(writablePath);
  
  try {
    try {
      const data = await fs.readFile(writablePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error: unknown) {
      if (!isErrnoException(error) || error.code !== 'ENOENT') {
        console.error(`Error reading ${filename} from writable:`, error);
      }
      // File doesn't exist in writable dir, try primary (committed) dir
    }
    
    const primaryPath = path.join(primaryDataDir, `${filename}.json`);
    const data = await fs.readFile(primaryPath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error: unknown) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      // File doesn't exist anywhere - return default empty structure
      if (filename === 'carousel') return { images: [] } as unknown as T;
      if (filename === 'events') return { events: [] } as unknown as T;
      if (filename === 'resources') return { resources: [] } as unknown as T;
      if (filename === 'form-backup') return { submissions: [] } as unknown as T;
      if (filename === 'site-images') return { images: [] } as unknown as T;
    }
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}`);
  } finally {
    release();
  }
}

export async function upsertSiteImage(image: SiteImage): Promise<void> {
  if (pool) {
    try {
      await upsertSiteImageToDb(image);
      return;
    } catch (error) {
      console.error('[DataService] CRITICAL: Failed to upsert site-image in DB:', error);
      throw new Error(
        `Failed to upsert site-image in database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent data loss in serverless environments.'
      );
    }
  }

  const data = await readData<{ images: SiteImage[] }>('site-images');
  const existingIndex = data.images.findIndex((i) => i.key === image.key);
  if (existingIndex >= 0) {
    data.images[existingIndex] = image;
  } else {
    data.images.push(image);
  }
  await writeData('site-images', data);
}

export async function deleteSiteImageByKey(key: string): Promise<void> {
  if (pool) {
    try {
      await deleteSiteImageByKeyInDb(key);
      return;
    } catch (error) {
      console.error('[DataService] CRITICAL: Failed to delete site-image in DB:', error);
      throw new Error(
        `Failed to delete site-image from database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent data loss in serverless environments.'
      );
    }
  }

  const data = await readData<{ images: SiteImage[] }>('site-images');
  data.images = data.images.filter((i) => i.key !== key);
  await writeData('site-images', data);
}

// Write data to JSON file or PostgreSQL for events/content
export async function writeData<T>(filename: string, data: T): Promise<void> {
  // Use database for events if available
  if (filename === 'events' && pool) {
    try {
      const eventsData = data as { events: Event[] };
      await writeEventsToDb(eventsData.events);
      return;
    } catch (error) {
      console.error('[DataService] CRITICAL: Failed to write events to DB:', error);
      // DO NOT fall back to JSON for events - in serverless environments,
      // /tmp is ephemeral and data will appear to be "lost" on next request.
      // It's better to fail fast and alert than to silently write to ephemeral storage.
      throw new Error(
        `Failed to persist events to database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent data loss in serverless environments.'
      );
    }
  }

  // Persist app_config-backed files to Postgres when DB is available so admin
  // edits survive deploys and serverless cold starts (/tmp is ephemeral).
  if (APP_CONFIG_KEYS.has(filename) && pool) {
    try {
      await writeAppConfigToDb(filename, data);
      return;
    } catch (error) {
      console.error(`[DataService] CRITICAL: Failed to write app_config "${filename}" to DB:`, error);
      throw new Error(
        `Failed to persist ${filename} to database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent data loss in serverless environments.'
      );
    }
  }

  // Use database for site-images if available.
  // Intentional behavior: upsert-only by key so partial payloads do not delete existing records.
  if (filename === 'site-images' && pool) {
    try {
      const siteImagesData = data as { images: SiteImage[] };
      await writeSiteImagesToDb(siteImagesData.images || []);
      return;
    } catch (error) {
      console.error('[DataService] CRITICAL: Failed to write site-images to DB:', error);
      throw new Error(
        `Failed to persist site-images to database: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'JSON fallback disabled to prevent data loss in serverless environments.'
      );
    }
  }

  const filePath = path.join(writableDataDir, `${filename}.json`);
  const tempPath = `${filePath}.tmp`;
  const release = await acquireLock(filePath);
  
  try {
    let dataToWrite = data;

    // Safety merge for site-images in JSON mode: callers may pass partial subsets.
    // Merge by key under the same file lock to avoid dropping previously stored images.
    if (filename === 'site-images') {
      const incomingImages = ((data as unknown as { images?: SiteImage[] })?.images || []) as SiteImage[];
      let existingImages: SiteImage[] = [];

      try {
        const existingRaw = await fs.readFile(filePath, 'utf8');
        const existingParsed = JSON.parse(existingRaw) as { images?: SiteImage[] };
        existingImages = Array.isArray(existingParsed.images) ? existingParsed.images : [];
      } catch (error: unknown) {
        const primaryPath = path.join(primaryDataDir, `${filename}.json`);
        try {
          const primaryRaw = await fs.readFile(primaryPath, 'utf8');
          const primaryParsed = JSON.parse(primaryRaw) as { images?: SiteImage[] };
          existingImages = Array.isArray(primaryParsed.images) ? primaryParsed.images : [];
        } catch (primaryError: unknown) {
          if (!isErrnoException(primaryError) || primaryError.code !== 'ENOENT') {
            console.warn('[DataService] Failed to read existing site-images for merge, writing incoming payload only:', primaryError);
          }
        }

        if (!isErrnoException(error) || error.code !== 'ENOENT') {
          console.warn('[DataService] Failed to read writable site-images for merge, fell back to primary data:', error);
        }
      }

      dataToWrite = {
        images: mergeSiteImagesByKey(existingImages, incomingImages),
      } as unknown as T;
    }

    // Write to temporary file first for atomicity
    await fs.writeFile(tempPath, JSON.stringify(dataToWrite, null, 2), 'utf8');
    // Rename is atomic on most filesystems
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to write ${filename}`);
  } finally {
    release();
  }
}

// Types
export interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  imageSrc?: string;
  imageAlt: string;
  eventCategory: 'general' | 'coffee' | 'social' | 'fundraising' | 'advocacy' | 'education' | 'health' | 'youth' | 'pride' | 'volunteer' | 'cultural' | 'community';
  externalUrl?: string;
  externalCtaLabel?: string;
  summary?: string;
  isRecurring?: boolean;
  parentId?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
}

export interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  cloudinaryPublicId?: string; // For cleanup when deleting
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'north_west' | 'north_east' | 'south_west' | 'south_east';
}

export interface SiteImage {
  id: string;
  key: string;
  url: string;
  alt: string;
  caption?: string;
  updatedAt?: string; // Optional - undefined for predefined keys without images
  cloudinaryPublicId?: string; // For cleanup when deleting
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'north_west' | 'north_east' | 'south_west' | 'south_east'; // Crop focus point
  focalX?: number; // Focal point X coordinate (0-100)
  focalY?: number; // Focal point Y coordinate (0-100)
}
