import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';
const CRM_ADMIN_SECRET = process.env.CRM_ADMIN_SECRET || '';
const ALLOWED_CONTACT_TYPES = ['volunteer', 'donor', 'community-member', 'vendor'] as const;
const ALLOWED_VENDOR_TYPES = ['nonprofit', 'forprofit', 'food', 'political', 'government'] as const;

// Simple in-memory rate limiter: max submissions per IP within a window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Warn at startup if critical env vars are missing
if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.warn('[CRM] GHL_API_KEY or GHL_LOCATION_ID is not set — CRM requests will fail');
}
if (!CRM_ADMIN_SECRET) {
  console.warn('[CRM] CRM_ADMIN_SECRET is not set — dashboard access will be blocked');
}

// Allowed interest values to prevent arbitrary tag injection
const ALLOWED_VOLUNTEER_INTERESTS = [
  'Event Planning', 'Community Outreach', 'Youth Programs', 'Fundraising',
  'Social Media', 'Administrative Support', 'Mentorship', 'Healthcare Support',
];
const ALLOWED_COMMUNITY_INTERESTS = [
  'LGBTQ+ Advocacy', 'Youth Support', 'Parent Resources', 'Ally Programs',
  'Education', 'Health & Wellness', 'Legal Support', 'Faith Communities',
];

// Constant-time string comparison — hash both sides so length is never leaked
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

async function ghlRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GHL_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('GHL API Error:', response.status, error);
    throw new Error('CRM service request failed');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  // Require a non-empty admin secret and valid bearer token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!CRM_ADMIN_SECRET || !token || !safeEqual(token, CRM_ADMIN_SECRET)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Paginate to get all contacts for accurate stats
    const MAX_PAGES = 50; // Safety cap to avoid runaway pagination
    let contacts: any[] = [];
    let startAfterId = '';
    let hasMore = true;
    let page = 0;
    while (hasMore && page < MAX_PAGES) {
      page += 1;
      const url = '/contacts/?locationId=' + GHL_LOCATION_ID + '&limit=100'
        + (startAfterId ? '&startAfterId=' + startAfterId : '');
      const data = await ghlRequest(url);
      const batch = data?.contacts || [];
      contacts = contacts.concat(batch);
      // Stop when a page returns fewer than 100 or no results
      if (batch.length < 100) {
        hasMore = false;
      } else {
        startAfterId = batch[batch.length - 1].id;
      }
    }

    // Calculate stats from tags
    const totalContacts = contacts.length;
    const totalVolunteers = contacts.filter((c: any) => c.tags?.includes('volunteer')).length;
    const totalDonors = contacts.filter((c: any) => c.tags?.includes('donor')).length;
    const totalVendors = contacts.filter((c: any) =>
      c.tags?.some((t: string) => t.startsWith('vendor'))
    ).length;
    const totalCommunityMembers = contacts.filter((c: any) => c.tags?.includes('community-member')).length;

    // Recent contacts (last 10)
    const recentContacts = contacts
      .sort((a: any, b: any) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 10)
      .map((c: any) => ({
        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        email: c.email,
        tags: c.tags || [],
        dateAdded: c.dateAdded,
        company: c.companyName,
      }));

    return NextResponse.json({
      success: true,
      data: {
        totalContacts,
        totalVolunteers,
        totalDonors,
        totalVendors,
        totalCommunityMembers,
        recentContacts,
      },
    });
  } catch (error) {
    console.error('CRM Dashboard Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch CRM data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, name, email, phone, interests, availability, amount, frequency, pronouns,
      company, address, city, state, postalCode, website, socialMedia,
      vendorType, vendorFee, productsServices,
      _gotcha, // honeypot field — bots fill this, real users don't see it
    } = body;

    // Reject bot submissions that filled the hidden honeypot field
    if (_gotcha) {
      return NextResponse.json({ success: true, message: 'Thank you!' });
    }

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!type || !ALLOWED_CONTACT_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact type' },
        { status: 400 }
      );
    }

    // Rate-limit public form submissions
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // Build tags — only allow known interest values to prevent tag injection
    const tags: string[] = [type];
    if (interests && Array.isArray(interests)) {
      const allowed = type === 'volunteer' ? ALLOWED_VOLUNTEER_INTERESTS
        : type === 'community-member' ? ALLOWED_COMMUNITY_INTERESTS
        : [];
      const safeInterests = interests.filter((i: string) => allowed.includes(i));
      tags.push(...safeInterests);
    }
    if (vendorType) {
      if (!ALLOWED_VENDOR_TYPES.includes(vendorType)) {
        return NextResponse.json(
          { success: false, error: 'Invalid vendor type' },
          { status: 400 }
        );
      }
      tags.push(`vendor-${vendorType}`);
      tags.push('chase-the-rainbow-5k-2026');
    }

    // Build custom fields — scope donor fields to donor type only
    const customFields: Record<string, any> = {};
    if (availability) customFields.availability = availability;
    if (pronouns) customFields.pronouns = pronouns;
    if (type === 'donor' && frequency) customFields.donation_frequency = frequency;
    if (type === 'donor' && amount) customFields.last_donation_amount = amount;
    if (interests && Array.isArray(interests)) customFields.interests = interests.join(', ');
    // Vendor-specific fields
    if (company) customFields.company_name = company;
    if (website) customFields.website = website;
    if (socialMedia) customFields.social_media = socialMedia;
    if (vendorType) customFields.vendor_type = vendorType;
    if (vendorFee) customFields.vendor_fee = vendorFee;
    if (productsServices) customFields.products_services = productsServices;

    // Build address object
    const contactAddress: Record<string, string> = {};
    if (address) contactAddress.street = address;
    if (city) contactAddress.city = city;
    if (state) contactAddress.state = state;
    if (postalCode) contactAddress.postalCode = postalCode;

    // Create contact in GrowthSphere360
    const contactPayload: Record<string, any> = {
      name,
      email,
      phone,
      tags,
      customFields,
      locationId: GHL_LOCATION_ID,
    };
    if (company) contactPayload.companyName = company;
    if (Object.keys(contactAddress).length > 0) contactPayload.address = contactAddress;

    const contact = await ghlRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify(contactPayload),
    });

    return NextResponse.json({
      success: true,
      message: type === 'vendor'
        ? 'Thank you for your vendor application! A contract will be sent to your email after payment is processed.'
        : 'Thank you! Your information has been submitted successfully.',
      data: { contactId: contact?.contact?.id },
    });
  } catch (error) {
    console.error('CRM API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
