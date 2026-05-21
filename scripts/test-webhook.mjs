/**
 * Stripe webhook smoke-test script
 *
 * Usage:
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx node scripts/test-webhook.mjs [URL]
 *
 * Defaults to testing http://localhost:3000/api/track-payment.
 * For the live Vercel deployment pass your production URL:
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx node scripts/test-webhook.mijs https://katypride-org.vercel.app/api/track-payment
 */

import Stripe from 'stripe';

const secret = process.env.STRIPE_WEBHOOK_SECRET;
const targetUrl = process.argv[2] || 'http://localhost:3000/api/track-payment';

if (!secret) {
  console.error('Error: STRIPE_WEBHOOK_SECRET env var is required');
  process.exit(1);
}

// Use a dummy key only for the webhook signing helper (no real Stripe API call)
const stripe = new Stripe('sk_test_dummy', { apiVersion: '2025-02-24.acacia' });

// Build a realistic payment_intent.succeeded event for a vendor payment
const payload = {
  id: `evt_${Date.now()}`,
  object: 'event',
  api_version: '2025-02-24.acacia',
  created: Math.floor(Date.now() / 1000),
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: `pi_${Date.now()}`,
      object: 'payment_intent',
      amount: 27500,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        type: 'vendor',
        donor_email: 'test-webhook@example.com',
        donor_name: 'Webhook Test',
        vendorType: 'nonprofit',
        crmContactId: '',
      },
      payment_method_types: ['card'],
      charges: {
        data: [],
      },
    },
  },
};

const payloadString = JSON.stringify(payload);
const signature = stripe.webhooks.generateTestHeaderString({
  payload: payloadString,
  secret,
});

console.log(`Sending test webhook to: ${targetUrl}`);
console.log(`Event type: ${payload.type}`);
console.log(`Event id:   ${payload.id}`);

const res = await fetch(targetUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': signature,
  },
  body: payloadString,
});

const bodyText = await res.text();

console.log('\n--- Response ---');
console.log(`Status: ${res.status} ${res.statusText}`);
try {
  console.log('Body:', JSON.parse(bodyText));
} catch {
  console.log('Body:', bodyText);
}

if (res.status >= 200 && res.status < 300) {
  console.log('\n✅ Webhook returned 2xx — Stripe will accept this.');
} else {
  console.error('\n❌ Webhook returned non-2xx — Stripe would retry.');
  process.exit(1);
}
