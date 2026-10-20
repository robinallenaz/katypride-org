/**
 * Replay form submissions that failed to reach the CRM back through /api/crm.
 *
 * Every failed submission is stored in form_submissions with crm_success = false,
 * so once the underlying CRM problem is fixed those contacts can be re-sent.
 *
 * Run (dry run, prints what would be replayed):
 *   node scripts/replay-failed-crm-submissions.mjs
 * Run for real:
 *   node scripts/replay-failed-crm-submissions.mjs --apply
 *
 * Options:
 *   --apply            Actually POST to the CRM and mark rows as synced.
 *   --site=<url>       Target site (default https://www.katypride.org).
 *   --type=<type>      Only replay one submission type (donor, vendor, ...).
 *   --since=<date>     Only replay submissions on/after this ISO date.
 *   --delay=<ms>       Delay between requests (default 15000; /api/crm allows
 *                      5 requests per minute per IP).
 *
 * Prerequisites: DATABASE_URL in .env.local.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : fallback;
};

const APPLY = args.includes('--apply');
const SITE_URL = getArg('site', 'https://www.katypride.org').replace(/\/$/, '');
const TYPE_FILTER = getArg('type', '');
const SINCE = getArg('since', '');
const DELAY_MS = parseInt(getArg('delay', '15000'), 10);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required (set it in .env.local)');
  process.exit(1);
}

// Bookkeeping fields that describe the stored row rather than the submission
// itself. Re-posting them would confuse /api/crm's payload validation.
const INTERNAL_FIELDS = ['error', 'crmSuccess', 'crm_success', 'contactId', '_dbId', 'replayedAt'];

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadFailedSubmissions(client) {
  const params = [];
  const conditions = ['crm_success = FALSE'];
  if (TYPE_FILTER) {
    params.push(TYPE_FILTER);
    conditions.push(`type = $${params.length}`);
  }
  if (SINCE) {
    params.push(new Date(SINCE));
    conditions.push(`timestamp >= $${params.length}`);
  }

  const result = await client.query(
    `SELECT id, timestamp, type, name, email, data
     FROM form_submissions
     WHERE ${conditions.join(' AND ')}
     ORDER BY timestamp ASC`,
    params
  );
  return result.rows;
}

/**
 * A blocked form is usually retried several times, so the same person appears
 * once per attempt. Replay only the newest attempt per email+type and mark the
 * earlier attempts as handled alongside it.
 */
function groupLatestPerContact(rows) {
  const groups = new Map();
  for (const row of rows) {
    const email = (row.email || row.data?.email || '').toLowerCase();
    if (!email) continue;
    const key = `${email}|${row.type || row.data?.type || ''}`;
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(row.id);
      if (new Date(row.timestamp) >= new Date(existing.row.timestamp)) existing.row = row;
    } else {
      groups.set(key, { row, ids: [row.id] });
    }
  }
  return [...groups.values()];
}

function buildPayload(row) {
  const data = typeof row.data === 'object' && row.data !== null ? row.data : {};
  const payload = { ...data };
  for (const field of INTERNAL_FIELDS) delete payload[field];
  payload.type = row.type || data.type;
  payload.name = row.name || data.name;
  payload.email = row.email || data.email;
  delete payload.timestamp;
  payload._gotcha = '';
  payload.source = data.source ? `${data.source} (replay)` : 'CRM replay';
  return payload;
}

async function markSynced(client, ids) {
  await client.query(
    `UPDATE form_submissions
     SET crm_success = TRUE,
         data = COALESCE(data, '{}'::jsonb) || jsonb_build_object('replayedAt', $2::text)
     WHERE id = ANY($1::int[])`,
    [ids, new Date().toISOString()]
  );
}

async function main() {
  const client = await pool.connect();
  try {
    const rows = await loadFailedSubmissions(client);
    const groups = groupLatestPerContact(rows);

    console.log(
      `Found ${rows.length} failed submission(s) covering ${groups.length} contact(s).` +
        (APPLY ? '' : ' Dry run — pass --apply to replay them.')
    );

    let replayed = 0;
    let failed = 0;

    for (const [index, group] of groups.entries()) {
      const { row, ids } = group;
      const payload = buildPayload(row);
      const label = `${payload.name || payload.email} (${payload.type}, ${ids.length} attempt(s))`;

      if (!payload.type || !payload.email) {
        console.log(`  skip  ${label}: missing type or email`);
        continue;
      }

      if (!APPLY) {
        console.log(`  would replay  ${label} — last error: ${row.data?.error || 'unknown'}`);
        continue;
      }

      try {
        const response = await fetch(`${SITE_URL}/api/crm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await response.text();
        if (!response.ok) {
          failed++;
          console.log(`  FAILED  ${label}: HTTP ${response.status} ${body.slice(0, 200)}`);
        } else {
          await markSynced(client, ids);
          replayed++;
          console.log(`  ok      ${label}`);
        }
      } catch (error) {
        failed++;
        console.log(`  FAILED  ${label}: ${error instanceof Error ? error.message : error}`);
      }

      if (index < groups.length - 1) await sleep(DELAY_MS);
    }

    if (APPLY) {
      console.log(`\nReplayed ${replayed} contact(s), ${failed} still failing.`);
    }
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
