import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2026-03-25.dahlia',
  });

  const sessionId = request.nextUrl.searchParams.get('session_id');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  // Validate session ID format (Stripe session IDs start with 'cs_')
  if (!sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
  }

  try {
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
