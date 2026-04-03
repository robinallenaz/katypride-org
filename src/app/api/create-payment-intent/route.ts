import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not configured')
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  try {
    const { amount, currency = 'usd', payment_method_type, donor_email, donor_name, donation_frequency } = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 50000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // payment_method_types and automatic_payment_methods are mutually exclusive in Stripe
    const paymentMethodTypes = payment_method_type === 'card' ? ['card'] : undefined
    const automaticPaymentMethods = payment_method_type !== 'card' ? { enabled: true } : undefined

    // Create payment intent with metadata for CRM tracking
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
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
