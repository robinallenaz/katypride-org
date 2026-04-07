import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Kill switch: Check if Stripe payments are disabled
const stripeEnabled = process.env.STRIPE_ENABLED !== 'false';

// Lazy Stripe initialization
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
      apiVersion: '2026-03-25.dahlia',
    });
  }
  
  return stripeInstance;
}

export async function POST(request: Request) {
  // Check kill switch first
  if (!stripeEnabled) {
    return NextResponse.json(
      { error: 'Payment processing is currently disabled' },
      { status: 503 }
    );
  }

  const stripe = getStripe();

  try {
    const { amount, currency = 'usd', payment_method_type, donor_email, donor_name, donation_frequency } = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 5000000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // payment_method_types and automatic_payment_methods are mutually exclusive in Stripe
    const paymentMethodTypes = payment_method_type === 'card' ? ['card'] : undefined
    const automaticPaymentMethods = payment_method_type !== 'card' ? { enabled: true } : undefined

    // Create payment intent with metadata for CRM tracking
    // Amount is already in cents from frontend
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      ...(paymentMethodTypes && { payment_method_types: paymentMethodTypes }),
      ...(automaticPaymentMethods && { automatic_payment_methods: automaticPaymentMethods }),
      metadata: {
        donor_email: String(donor_email || ''),
        donor_name: String(donor_name || ''),
        donation_frequency: String(donation_frequency || ''),
        payment_method_type: String(payment_method_type || ''),
      },
    })

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      return NextResponse.json({ error: error.message }, { status: 402 })
    }
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json({ error: 'Invalid payment request' }, { status: 400 })
    }
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe payment intent endpoint is active'
  })
}
