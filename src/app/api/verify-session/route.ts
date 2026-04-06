import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Kill switch: Check if Stripe payments are disabled
const stripeEnabled = process.env.STRIPE_ENABLED !== 'false';

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
    stripeInstance = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
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

  const sessionId = request.nextUrl.searchParams.get('session_id');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  // Validate session ID format (Stripe session IDs start with 'cs_')
  if (!sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        valid: true,
        status: session.payment_status,
        amount: session.amount_total,
        customerEmail: session.customer_email,
      });
    } else {
      return NextResponse.json({
        valid: false,
        status: session.payment_status,
        error: 'Payment not completed',
      }, { status: 402 });
    }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: error.statusCode || 400 }
      );
    }
    
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
