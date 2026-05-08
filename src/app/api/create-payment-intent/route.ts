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
    stripeInstance = new Stripe(stripeKey);
  }
  
  return stripeInstance;
}

// Server-side vendor pricing — authoritative source of truth.
// Keep in sync with src/components/VendorSignupForm.tsx.
const VENDOR_PRICES: Record<string, { price: number; loyaltyEligible: boolean }> = {
  nonprofit:  { price: 225, loyaltyEligible: true  },
  forprofit:  { price: 275, loyaltyEligible: true  },
  food:       { price: 300, loyaltyEligible: false },
  political:  { price: 275, loyaltyEligible: false },
  government: { price: 275, loyaltyEligible: false },
};

const LOYALTY_CODE = 'LOYAL50';
const LOYALTY_DISCOUNT = 50;
const LOYALTY_START = new Date('2026-05-01T00:00:00-05:00');
const LOYALTY_END = new Date('2026-06-01T00:00:00-05:00');

// TEST1: internal/test code — 99% off any vendor type, no time window.
const TEST_CODE = 'TEST1';
const TEST_PERCENT = 0.99;

function isLoyaltyWindowActive(now: Date = new Date()): boolean {
  return now >= LOYALTY_START && now < LOYALTY_END;
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
    const { amount, currency = 'usd', payment_method_type, donor_email, donor_name, donation_frequency, metadata } = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 5000000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Server-side validation for vendor payments: recompute expected amount
    // from vendorType + promoCode and reject mismatches. This guards against
    // client-side tampering (e.g. faking LOYAL50 on a food/political/government
    // vendor, or using the code outside the May 1–31, 2026 window).
    if (metadata && metadata.type === 'vendor') {
      const vendorType = String(metadata.vendorType || '');
      const pricing = VENDOR_PRICES[vendorType];
      if (!pricing) {
        return NextResponse.json({ error: 'Invalid vendor type' }, { status: 400 });
      }

      const submittedPromo = String(metadata.promoCode || '').trim().toUpperCase();
      const loyaltyApplies =
        submittedPromo === LOYALTY_CODE &&
        pricing.loyaltyEligible &&
        isLoyaltyWindowActive();
      const testApplies = submittedPromo === TEST_CODE;

      let expectedDiscountDollars = 0;
      if (loyaltyApplies) {
        expectedDiscountDollars = LOYALTY_DISCOUNT;
      } else if (testApplies) {
        expectedDiscountDollars = Math.round(pricing.price * TEST_PERCENT);
      }
      const expectedAmountCents = Math.max(0, (pricing.price - expectedDiscountDollars) * 100);

      if (Math.round(amount) !== expectedAmountCents) {
        return NextResponse.json(
          { error: 'Vendor fee amount does not match server-calculated price. Please refresh and try again.' },
          { status: 400 }
        );
      }

      // If client sent a promo code that doesn't apply, reject so CRM/Stripe
      // records never show a fake discount.
      const promoApplies = loyaltyApplies || testApplies;
      if (submittedPromo && submittedPromo !== '' && !promoApplies) {
        return NextResponse.json(
          { error: 'Promo code is not valid for this vendor type or is outside the eligible window.' },
          { status: 400 }
        );
      }
    }

    // payment_method_types and automatic_payment_methods are mutually exclusive in Stripe
    const paymentMethodTypes = payment_method_type === 'card' ? ['card'] : undefined
    const automaticPaymentMethods = payment_method_type !== 'card' ? { enabled: true } : undefined

    // Build Stripe metadata. Stripe allows up to 50 keys, 40 char keys,
    // 500 char values. Start with the standard fields and merge any
    // client-supplied metadata (coerced to strings and length-capped) so
    // vendor/CRM reconciliation data (type, vendorType, crmContactId,
    // promoCode, discountAmount, baseFee, company, etc.) is preserved on
    // the PaymentIntent for webhooks, refunds, and dashboard lookups.
    const stripeMetadata: Record<string, string> = {
      donor_email: String(donor_email || '').substring(0, 500),
      donor_name: String(donor_name || '').substring(0, 500),
      donation_frequency: String(donation_frequency || '').substring(0, 500),
      payment_method_type: String(payment_method_type || '').substring(0, 500),
    };

    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      for (const [rawKey, rawValue] of Object.entries(metadata)) {
        if (rawValue == null) continue;
        // Stripe metadata keys: <= 40 chars. Skip keys we've already set so
        // client can't clobber authoritative values.
        const key = String(rawKey).substring(0, 40);
        if (!key || key in stripeMetadata) continue;
        if (Object.keys(stripeMetadata).length >= 50) break;
        let valueStr: string;
        if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
          valueStr = String(rawValue);
        } else {
          // Skip nested objects/arrays — Stripe metadata is flat key/value strings.
          continue;
        }
        stripeMetadata[key] = valueStr.substring(0, 500);
      }
    }

    // Create payment intent with metadata for CRM tracking
    // Amount is already in cents from frontend
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      ...(paymentMethodTypes && { payment_method_types: paymentMethodTypes }),
      ...(automaticPaymentMethods && { automatic_payment_methods: automaticPaymentMethods }),
      metadata: stripeMetadata,
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
