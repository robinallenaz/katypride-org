-- Backfill Alex Mahlstedt's vendor submission into form_submissions
-- Run this against your Neon PostgreSQL database (e.g. via the Neon console
-- or psql). Adjust the timestamp if you know the exact payment time.

CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(50),
  name VARCHAR(255),
  email VARCHAR(255),
  data JSONB NOT NULL DEFAULT '{}',
  crm_success BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_timestamp ON form_submissions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(type);

INSERT INTO form_submissions (timestamp, type, name, email, data, crm_success)
SELECT
  '2026-05-04T18:00:00-05:00',
  'vendor',
  'Alex Mahlstedt',
  'transmasculinehouston@gmail.com',
  '{
    "type": "vendor",
    "name": "Alex Mahlstedt",
    "email": "transmasculinehouston@gmail.com",
    "company": "Transmasculine Alliance Houston",
    "vendorType": "nonprofit",
    "vendorFee": 175,
    "vendorBaseFee": 225,
    "promoCode": "LOYAL50",
    "discountAmount": 50,
    "paymentStatus": "paid",
    "event": "katy-pride-celebration-2026",
    "paymentIntentId": "pi_3TTXGTJalYEnAxna05MEKIVK",
    "source": "crm_fallback",
    "crmSuccess": true
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM form_submissions
  WHERE data->>'paymentIntentId' = 'pi_3TTXGTJalYEnAxna05MEKIVK'
);
