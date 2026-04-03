import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ghlRequest, GHL_LOCATION_ID } from '@/lib/ghl';

import { Redis } from '@upstash/redis';

// Initialize Redis client for rate limiting (works across serverless instances)
const redis = Redis.fromEnv();

// Environment variable validation at module load
const stripeKey = process.env.STRIPE_SECRET_KEY;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY is required but not configured');
}

if (!upstashUrl || !upstashToken) {
  console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. Rate limiting will use in-memory fallback (not suitable for production multi-instance deployments).');
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 checkout sessions per minute per IP
const MAX_BODY_SIZE_BYTES = 50 * 1024; // 50KB max request body

// Simple in-memory fallback for development or when Redis is not available
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const processingLocks = new Set<string>();

// Cleanup expired rate limit entries periodically to prevent memory growth
function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes (only if using in-memory fallback)
setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);

function getRateLimitKey(ip: string): string {
  return `checkout:${ip}`;
}

// Wait for lock to be released with timeout
async function acquireLock(key: string, timeoutMs: number = 100): Promise<boolean> {
  const startTime = Date.now();
  while (processingLocks.has(key)) {
    if (Date.now() - startTime > timeoutMs) {
      return false; // Timeout - couldn't acquire lock
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  processingLocks.add(key);
  return true;
}

function releaseLock(key: string): void {
  processingLocks.delete(key);
}

async function checkRateLimitInMemory(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = getRateLimitKey(ip);
  
  const lockAcquired = await acquireLock(key);
  if (!lockAcquired) {
    return { allowed: false, remaining: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW_MS };
  }

  try {
    const now = Date.now();
    
    // Periodic cleanup to prevent memory growth
    if (rateLimitMap.size > 100 && Math.random() < 0.1) {
      cleanupExpiredRateLimits();
    }
    
    // Hard limit: force cleanup of oldest entries if map exceeds 2000 entries
    if (rateLimitMap.size > 2000) {
      const entries = Array.from(rateLimitMap.entries())
        .sort((a, b) => a[1].resetTime - b[1].resetTime)
        .slice(0, Math.floor(rateLimitMap.size / 2));
      entries.forEach(([key]) => rateLimitMap.delete(key));
    }
    
    const entry = rateLimitMap.get(key);
    
    if (!entry || now > entry.resetTime) {
      const newEntry = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS,
      };
      rateLimitMap.set(key, newEntry);
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: newEntry.resetTime };
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
  } finally {
    releaseLock(key);
  }
}

async function checkRateLimitRedis(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `rate_limit:checkout:${ip}`;
  const now = Date.now();
  const windowStart = Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS;
  const resetTime = windowStart + RATE_LIMIT_WINDOW_MS;
  
  try {
    // Use Redis INCR to atomically increment the counter
    const currentCount = await redis.incr(key);
    
    // If this is the first request in the window, set expiration
    if (currentCount === 1) {
      await redis.pexpire(key, RATE_LIMIT_WINDOW_MS);
    }
    
    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentCount);
    const allowed = currentCount <= RATE_LIMIT_MAX_REQUESTS;
    
    return { allowed, remaining, resetTime };
  } catch (error) {
    console.error('Redis rate limiting failed, falling back to in-memory:', error);
    return checkRateLimitInMemory(ip);
  }
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Use Redis if available, otherwise fall back to in-memory
  if (upstashUrl && upstashToken) {
    return checkRateLimitRedis(ip);
  }
  return checkRateLimitInMemory(ip);
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback to connection info (may not work in all environments)
  return 'unknown';
}

// Vendor pricing from memory
const VENDOR_PRICES: Record<string, number> = {
  nonprofit: 22500,      // $225.00 in cents
  forprofit: 27500,      // $275.00 in cents
  food: 30000,           // $300.00 in cents
  political: 27500,      // $275.00 in cents (matches form display)
  government: 27500,     // $275.00 in cents (matches form display)
};

// Sponsor pricing (from both 5K and Celebration events)
const SPONSOR_PRICES: Record<string, number> = {
  // 5K Sponsorships
  'water-station': 0,           // Free
  'community': 10000,           // $100.00
  'bronze': 25000,              // $250.00
  'color-run': 35000,           // $350.00
  'silver': 50000,              // $500.00
  'kids-dash': 100000,          // $1,000.00
  'gold': 100000,               // $1,000.00
  'presenting': 250000,         // $2,500.00
  // Celebration Sponsorships (2026)
  'friends-of-pride': 25000,    // $250.00
  'rainbow': 50000,             // $500.00
  'silver-celebration': 100000, // $1,000.00
  'gold-celebration': 250000,  // $2,500.00
  'platinum': 500000,           // $5,000.00
  'title': 1000000,             // $10,000.00
  'entertainment': 750000,      // $7,500.00
  'hospitality': 500000,        // $5,000.00
  't-shirt': 400000,           // $4,000.00
  'wifi-charging': 500000,      // $5,000.00
  'swag-bag': 500000,          // $5,000.00
  'kid-zone': 300000,          // $3,000.00
};

export async function POST(request: NextRequest) {
  // Validate Content-Type (handle charsets like application/json; charset=utf-8)
  const contentType = request.headers.get('content-type');
  const normalizedContentType = contentType?.split(';')[0]?.trim();
  if (normalizedContentType !== 'application/json') {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }

  // Validate request body size
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = parseInt(contentLengthHeader, 10);
    if (!isNaN(contentLength) && contentLength > MAX_BODY_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Request body too large. Maximum size is ${MAX_BODY_SIZE_BYTES / 1024}KB` },
        { status: 413 }
      );
    }
  }

  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimit = await checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  }

  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any, // Pin to stable version
  });

  try {
    const body = await request.json();
    const {
      type,
      vendorType,
      sponsorshipLevel,
      customAmount,
      email,
      name,
      company,
      phone,
      address,
      city,
      state,
      postalCode,
      website,
      event,
      metadata,
      _gotcha,
    } = body;

    // Honeypot validation - reject if honeypot field is filled
    if (_gotcha) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    let amount: number;
    let productName: string;
    let productDescription: string;

    // Calculate amount based on type
    if (type === 'vendor') {
      if (!vendorType || !VENDOR_PRICES[vendorType]) {
        return NextResponse.json({ error: 'Invalid vendor type' }, { status: 400 });
      }
      amount = VENDOR_PRICES[vendorType];
      const vendorTypeLabels: Record<string, string> = {
        nonprofit: 'Non-Profit Vendor',
        forprofit: 'For-Profit Vendor',
        food: 'Food Vendor',
        political: 'Political Campaign Vendor',
        government: 'Government Entity Vendor',
      };
      productName = `Katy Pride 2026 Vendor Registration - ${vendorTypeLabels[vendorType]}`;
      productDescription = 'Vendor booth space at Katy Pride 2026 Celebration (October 3, 2026). Includes 10x10 booth space. Fees are non-refundable and non-transferable.';
    } else if (type === 'sponsor') {
      if (!sponsorshipLevel) {
        return NextResponse.json({ error: 'Sponsorship level is required' }, { status: 400 });
      }

      // Handle custom amount
      if (sponsorshipLevel === 'custom' && customAmount) {
        const parsedAmount = parseFloat(customAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return NextResponse.json({ error: 'Invalid custom amount' }, { status: 400 });
        }
        if (parsedAmount > 100000) {
          return NextResponse.json({ error: 'Amount exceeds maximum of $100,000' }, { status: 400 });
        }
        amount = Math.round(parsedAmount * 100);
        productName = 'Katy Pride Custom Sponsorship';
        productDescription = `Custom sponsorship for ${event === 'chase-the-rainbow-5k-2026' ? 'Chase the Rainbow 5K' : 'Katy Pride 2026 Celebration'}`;
      } else if (SPONSOR_PRICES[sponsorshipLevel] !== undefined) {
        amount = SPONSOR_PRICES[sponsorshipLevel];
        const levelLabels: Record<string, string> = {
          'water-station': 'Water Station Sponsor',
          'community': 'Community Sponsor',
          'bronze': 'Bronze Sponsor',
          'color-run': 'Color Run Sponsor',
          'silver': 'Silver Sponsor',
          'kids-dash': 'Kids Dash Sponsor',
          'gold': 'Gold Sponsor',
          'presenting': 'Presenting Sponsor',
          'friends-of-pride': 'Friends of Pride',
          'rainbow': 'Rainbow Sponsor',
          'silver-celebration': 'Silver Sponsor',
          'gold-celebration': 'Gold Sponsor',
          'platinum': 'Platinum Sponsor',
          'title': 'Title Sponsor',
          'entertainment': 'Entertainment Sponsor',
          'hospitality': 'Hospitality Sponsor',
          't-shirt': 'T-Shirt Sponsor',
          'wifi-charging': 'WiFi/Charging Sponsor',
          'swag-bag': 'Swag Bag Sponsor',
          'kid-zone': 'Kid Zone Sponsor',
        };
        const eventName = event === 'chase-the-rainbow-5k-2026' ? 'Chase the Rainbow 5K' : 'Katy Pride 2026 Celebration';
        productName = `${eventName} - ${levelLabels[sponsorshipLevel] || 'Sponsor'}`;
        productDescription = `Sponsorship package for ${eventName}. Thank you for supporting Katy Pride!`;
      } else {
        return NextResponse.json({ error: 'Invalid sponsorship level' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be vendor or sponsor' }, { status: 400 });
    }

    // Handle free sponsorships ($0 amount) - create CRM contact directly, skip Stripe
    if (amount === 0) {
      try {
        const isVendor = type === 'vendor';
        
        const contactData: any = {
          email: String(email || ''),
          name: String(name || ''),
          locationId: GHL_LOCATION_ID,
          tags: isVendor ? ['vendor', 'free-tier'] : ['sponsor', 'free-tier'],
          customFields: {
            payment_status: 'free',
            payment_amount: 0,
            registration_date: new Date().toISOString(),
            ...(isVendor && { vendor_type: String(vendorType || '') }),
            ...(!isVendor && { sponsorship_level: String(sponsorshipLevel || '') }),
            ...(phone && { phone: String(phone || '') }),
          },
        };

        // Add company name if available
        if (company) {
          contactData.companyName = company;
        }

        // Lookup existing contact by email to avoid duplicates
        let existingContactId: string | null = null;
        try {
          const lookup = await ghlRequest(
            `/contacts/lookup?email=${encodeURIComponent(email || '')}`
          );
          existingContactId = lookup?.contacts?.[0]?.id || null;
        } catch {
          // Contact not found — will create a new one below
        }

        if (existingContactId) {
          await ghlRequest(`/contacts/${existingContactId}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
          });
        } else {
          await ghlRequest('/contacts/', {
            method: 'POST',
            body: JSON.stringify(contactData),
          });
        }

        console.log(`Created/updated free ${type} contact for ${email}`);

        return NextResponse.json({
          sessionId: null,
          url: null,
          free: true,
          message: 'This is a free sponsorship tier. No payment required. Your registration has been recorded.',
        });
      } catch (ghlError) {
        console.error('Failed to create free tier contact in CRM:', ghlError);
        return NextResponse.json(
          { error: 'Failed to register free sponsorship. Please try again or contact us.' },
          { status: 500 }
        );
      }
    }

    // Validate minimum amount (Stripe requires at least $0.50 for most payment methods)
    if (amount > 0 && amount < 50) {
      return NextResponse.json({ error: 'Amount must be at least $0.50' }, { status: 400 });
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'https://katypride.org';
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    // Build metadata for webhook processing
    // Client metadata is stringified to prevent injection attacks
    const sessionMetadata: Record<string, string> = {
      type,
      email: String(email || ''),
      name: String(name || ''),
      company: String(company || ''),
      phone: String(phone || ''),
      event: String(event || ''),
      ...(type === 'vendor' && { vendorType: String(vendorType || '') }),
      ...(type === 'sponsor' && { sponsorshipLevel: String(sponsorshipLevel || '') }),
      // Store client metadata as JSON string to prevent key injection
      ...(metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0 && { 
        _clientMetadata: JSON.stringify(metadata) 
      }),
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
              images: ['https://katypride.org/logo.png'], // Optional: Add your logo
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      // Store customer info for future reference
      client_reference_id: `${type}-${Date.now()}`,
      // Custom text on checkout page
      custom_text: {
        submit: {
          message: 'Thank you for supporting Katy Pride! You will receive a confirmation email with next steps.',
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe checkout session endpoint is active',
  });
}
