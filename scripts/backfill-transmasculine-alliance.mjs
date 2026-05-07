#!/usr/bin/env node
/**
 * Backfill Transmasculine Alliance Houston vendor submission
 * into the PostgreSQL form_submissions table.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/backfill-transmasculine-alliance.mjs
 */

import { Pool } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const data = {
      name: 'Alex Mahlstedt',
      email: 'transmasculinehouston@gmail.com',
      company: 'Transmasculine Alliance Houston',
      type: 'vendor',
      vendorType: 'nonprofit',
      paymentStatus: 'paid',
      baseFee: 225,
      discountAmount: 50,
      promoCode: 'LOYAL50',
      vendorFee: 175,
      paymentIntentId: 'pi_3TTXGTJalYEnAxna05MEKIVK',
      timestamp: '2026-05-06T12:00:00Z',
      address: '1340 W Gray St apt 269 Houston TX 77019',
      backfilled: true,
      backfillSource: 'Stripe metadata + signed contract',
    };

    const result = await client.query(
      `INSERT INTO form_submissions (timestamp, type, name, email, data, crm_success)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [
        data.timestamp,
        data.type,
        data.name,
        data.email,
        JSON.stringify(data),
        true,
      ]
    );

    if (result.rowCount === 0) {
      console.log('Record already exists (skipped via ON CONFLICT)');
    } else {
      console.log(`Inserted backfill record with id=${result.rows[0].id}`);
    }

    // Verify
    const verify = await client.query(
      'SELECT id, timestamp, type, name, email FROM form_submissions WHERE email = $1 ORDER BY timestamp DESC',
      [data.email]
    );
    console.log(`Found ${verify.rowCount} record(s) for ${data.email}:`, verify.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
