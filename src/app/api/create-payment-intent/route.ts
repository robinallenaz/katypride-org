import { NextRequest, NextResponse } from 'next/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', payment_method_type, donor_email, donor_name, donation_frequency } = await request.json()

    // Validate required fields
    if (!amount || !donor_email || !donor_name) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, donor_email, donor_name' },
        { status: 400 }
      )
    }

    // Initialize Stripe
    const stripe = require('stripe')(STRIPE_SECRET_KEY)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card'], // Start with cards, can be extended for Google Pay/Amazon Pay
      receipt_email: donor_email,
      metadata: {
        donor_name,
        donor_email,
        donation_frequency,
        source: 'katypride_donation',
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    })

    // Create contact in CRM with payment intent info
    try {
      const crmPayload = {
        type: 'donor',
        name: donor_name,
        email: donor_email,
        donationAmount: (amount / 100).toString(),
        donationFrequency: donation_frequency,
        paymentMethod: payment_method_type,
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        source: 'Donation Form - Payment Initiated',
        _gotcha: '',
      }

      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/crm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crmPayload),
      })
    } catch (crmError) {
      console.error('Failed to create CRM contact:', crmError)
      // Don't fail the payment if CRM fails
    }

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
