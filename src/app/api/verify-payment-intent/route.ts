import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordPaymentVerification, checkRateLimit } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

// Kill switch: Check if Stripe payments are enabled (default to disabled for safety)
const stripeEnabled = process.env.STRIPE_ENABLED === 'true';

// Lazy initialization - don't throw at module load
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeEnabled) {
    throw new Error('Stripe is disabled via STRIPE_ENABLED env var');
  }

  if (!stripeInstance) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(stripeKey);
  }

  return stripeInstance;
}

export async function GET(request: NextRequest) {
  // Check kill switch first
  if (!stripeEnabled) {
    return NextResponse.json(
      { error: 'Payment verification is currently disabled' },
      { status: 503 }
    );
  }

  // Validate Stripe configuration before attempting any Stripe calls
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[VerifyPayment] STRIPE_SECRET_KEY is not configured');
    return NextResponse.json(
      { error: 'Payment verification is temporarily unavailable' },
      { status: 503 }
    );
  }

  // Apply rate limiting (5 requests per 15 minutes per IP)
  // More aggressive for payment verification to prevent abuse
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') || // Cloudflare
                   'unknown';
  const rateLimitResult = await checkRateLimit(`payment-verify:${clientIp}`, 5, 15);
  if (!rateLimitResult.allowed) {
    console.warn(`[VerifyPayment] Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const paymentIntentId = request.nextUrl.searchParams.get('payment_intent');
  const redirectStatus = request.nextUrl.searchParams.get('redirect_status');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Validate payment intent ID format (Stripe PI IDs start with 'pi_')
  if (!paymentIntentId.startsWith('pi_')) {
    console.warn(`[VerifyPayment] Invalid payment intent ID format: ${paymentIntentId}`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Validate redirect_status to ensure this is from a legitimate Stripe redirect flow
  // This prevents replay attacks where someone directly calls the endpoint with a payment_intent_id
  if (redirectStatus !== 'succeeded') {
    console.warn(`[VerifyPayment] Invalid or missing redirect_status (got: ${redirectStatus})`);
    return NextResponse.json(
      { error: 'Invalid request - must be called from Stripe redirect' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Validate payment intent creation time to prevent replay attacks with old intents
    // Payment intents older than 2 hours are considered expired for verification purposes
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const createdAt = new Date(paymentIntent.created * 1000); // Stripe uses seconds
    if (createdAt < twoHoursAgo) {
      console.warn(`[VerifyPayment] Payment intent ${paymentIntentId} is too old (created: ${createdAt.toISOString()})`);
      return NextResponse.json(
        { valid: false, code: 'PAYMENT_EXPIRED', error: 'Payment verification failed - payment intent expired' },
        { status: 400 }
      );
    }

    if (paymentIntent.status === 'succeeded') {
      // Validate this is actually a vendor/sponsor payment, not a reused donation
      const metadata = paymentIntent.metadata || {};
      const isVendorPayment = metadata.type === 'vendor' || metadata.type === 'sponsor';
      if (!isVendorPayment) {
        console.warn(`[VerifyPayment] Payment ${paymentIntentId} is not a vendor/sponsor payment (type: ${metadata.type})`);
        return NextResponse.json(
          { valid: false, code: 'INVALID_TYPE', error: 'Payment verification failed' },
          { status: 400 }
        );
      }

      // Validate payment amount matches expected vendor/sponsor fees
      const expectedAmounts: Record<string, Record<string, number>> = {
        vendor: {
          'non-profit': 22500,
          'for-profit': 27500,
          'political': 30000,
          'government': 30000,
          'food': 30000
        },
        sponsor: {
          'friends': 25000,
          'rainbow': 50000,
          'silver': 100000,
          'gold': 250000,
          'platinum': 500000,
          'title': 1000000
        }
      };
      const expectedAmount = expectedAmounts[metadata.type]?.[metadata.tier] || expectedAmounts[metadata.type]?.[metadata.category];
      if (!expectedAmount) {
        console.warn(`[VerifyPayment] Payment ${paymentIntentId} has invalid tier/category (type: ${metadata.type}, tier: ${metadata.tier}, category: ${metadata.category})`);
        return NextResponse.json(
          { valid: false, code: 'INVALID_TIER', error: 'Payment verification failed' },
          { status: 400 }
        );
      }
      if (paymentIntent.amount !== expectedAmount) {
        console.warn(`[VerifyPayment] Payment ${paymentIntentId} amount mismatch (expected: ${expectedAmount}, actual: ${paymentIntent.amount})`);
        return NextResponse.json(
          { valid: false, code: 'AMOUNT_MISMATCH', error: 'Payment verification failed' },
          { status: 400 }
        );
      }

      // Record verification in database to prevent URL reuse
      // This stores the server-side timestamp instead of trusting client-provided timestamp
      // Only record AFTER confirming payment is succeeded to prevent race conditions
      const verificationResult = await recordPaymentVerification(paymentIntentId);
      if (!verificationResult.valid) {
        console.warn(`[VerifyPayment] Verification failed for ${paymentIntentId}: ${verificationResult.error}`);
        return NextResponse.json(
          { valid: false, code: 'EXPIRED', error: verificationResult.error || 'Payment verification failed' },
          { status: 400 }
        );
      }

      console.log(`[VerifyPayment] Payment verified successfully: ${paymentIntentId}`);
      return NextResponse.json({
        valid: true,
        status: paymentIntent.status,
      });
    } else {
      console.log(`[VerifyPayment] Payment ${paymentIntentId} not succeeded (status: ${paymentIntent.status})`);
      return NextResponse.json({
        valid: false,
        code: 'PAYMENT_NOT_SUCCEEDED',
        status: paymentIntent.status,
        error: 'Payment verification failed',
      }, { status: 402 });
    }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`[VerifyPayment] Stripe error for ${paymentIntentId}:`, error.message);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: error.statusCode || 400 }
      );
    }

    console.error('[VerifyPayment] Error verifying payment intent:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
