import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { ghlRequest, GHL_LOCATION_ID } from '@/lib/ghl'

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.error('Stripe webhook configuration missing')
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { donor_email, donor_name, donation_frequency } = paymentIntent.metadata

    if (donor_email) {
      try {
        const contactData = {
          email: donor_email,
          name: donor_name || '',
          locationId: GHL_LOCATION_ID,
          tags: ['donor'],
          customFields: {
            last_payment_intent_id: paymentIntent.id,
            last_payment_status: 'succeeded',
            last_donation_amount: paymentIntent.amount / 100,
            last_payment_method: paymentIntent.payment_method_types?.[0] || '',
            donation_frequency: donation_frequency || '',
          },
        }

        // Lookup existing contact by email to avoid duplicates on webhook retries
        let existingContactId: string | null = null
        try {
          const lookup = await ghlRequest(
            `/contacts/lookup?email=${encodeURIComponent(donor_email)}`
          )
          existingContactId = lookup?.contacts?.[0]?.id || null
        } catch {
          // Contact not found — will create a new one below
        }

        if (existingContactId) {
          await ghlRequest(`/contacts/${existingContactId}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
          })
        } else {
          await ghlRequest('/contacts/', {
            method: 'POST',
            body: JSON.stringify(contactData),
          })
        }
      } catch (ghlError) {
        // Log but return 200 — Stripe retries on non-2xx, and GHL failures
        // shouldn't cause repeated webhook delivery attempts
        console.error('Failed to update GHL contact after payment:', ghlError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
