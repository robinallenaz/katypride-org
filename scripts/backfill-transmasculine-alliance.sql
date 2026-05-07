-- Backfill script for Transmasculine Alliance Houston vendor submission
-- This submission was processed by Stripe but lost from the website form backup
-- before the direct-DB-insert fix was applied.

INSERT INTO form_submissions (
  timestamp,
  type,
  name,
  email,
  data,
  crm_success
) VALUES (
  '2026-05-06T12:00:00Z'::timestamptz,
  'vendor',
  'Alex Mahlstedt',
  'transmasculinehouston@gmail.com',
  jsonb_build_object(
    'name', 'Alex Mahlstedt',
    'email', 'transmasculinehouston@gmail.com',
    'company', 'Transmasculine Alliance Houston',
    'type', 'vendor',
    'vendorType', 'nonprofit',
    'paymentStatus', 'paid',
    'baseFee', 225,
    'discountAmount', 50,
    'promoCode', 'LOYAL50',
    'vendorFee', 175,
    'paymentIntentId', 'pi_3TTXGTJalYEnAxna05MEKIVK',
    'timestamp', '2026-05-06T12:00:00Z',
    'address', '1340 W Gray St apt 269 Houston TX 77019',
    'backfilled', true,
    'backfillSource', 'Stripe metadata + signed contract'
  ),
  true
)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT * FROM form_submissions WHERE email = 'transmasculinehouston@gmail.com' ORDER BY timestamp DESC;
