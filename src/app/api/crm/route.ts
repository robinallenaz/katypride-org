import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';
const CRM_ADMIN_SECRET = process.env.CRM_ADMIN_SECRET || '';
const ALLOWED_CONTACT_TYPES = ['volunteer', 'donor', 'community-member', 'vendor'] as const;
const ALLOWED_VENDOR_TYPES = ['nonprofit', 'forprofit', 'food', 'political', 'government'] as const;

// Enhanced rate limiter with cleanup and better IP detection
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const MAX_RATE_LIMIT_ENTRIES = 1000; // Prevent memory exhaustion
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 300_000;
let cleanupInterval: NodeJS.Timeout | null = null;

// Initialize cleanup interval
const startCleanupInterval = () => {
  if (cleanupInterval) return; // Prevent multiple intervals
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Collect entries to delete
    rateLimitMap.forEach((entry, ip) => {
      if (now > entry.resetAt) {
        entriesToDelete.push(ip);
      }
    });
    
    // Delete expired entries
    entriesToDelete.forEach(ip => rateLimitMap.delete(ip));
    
    // Prevent memory exhaustion - remove oldest entries if too many
    if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
      const entries = Array.from(rateLimitMap.entries());
      entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
      const toDelete = entries.slice(0, rateLimitMap.size - MAX_RATE_LIMIT_ENTRIES);
      toDelete.forEach(([ip]) => rateLimitMap.delete(ip));
    }
  }, CLEANUP_INTERVAL_MS);
};

// Cleanup interval on process exit
process.on('beforeExit', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
});

process.on('SIGINT', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
});

process.on('SIGTERM', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
});

// Start the cleanup interval
startCleanupInterval();

function getClientIP(request: NextRequest): string {
  // Try multiple headers in order of reliability
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIP = request.headers.get('x-client-ip');
  
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }
  if (realIP) return realIP.trim();
  if (cfConnectingIP) return cfConnectingIP.trim();
  if (xClientIP) return xClientIP.trim();
  
  return 'unknown';
}

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

// Enhanced text sanitization to prevent XSS
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove HTML tags and script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>"'&]/g, '')
    // Remove JavaScript event handlers and protocols
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}
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
    // Simple in-memory cache for dashboard data (5 minute cache)
    const CACHE_KEY = 'crm_dashboard_data';
    const CACHE_DURATION_MS = 300_000; // 5 minutes
    const now = Date.now();
    
    // Check cache first
    const cachedData = (global as any).crmCache?.[CACHE_KEY];
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION_MS) {
      return NextResponse.json({
        success: true,
        data: cachedData.data,
        cached: true,
      });
    }

    // Paginate to get all contacts for accurate stats with optimization
    const MAX_PAGES = 20; // Reduced from 50 for better performance
    let contacts: any[] = [];
    let startAfterId = '';
    let hasMore = true;
    let page = 0;
    
    while (hasMore && page < MAX_PAGES) {
      page += 1;
      try {
        const url = '/contacts/?locationId=' + GHL_LOCATION_ID + '&limit=100'
          + (startAfterId ? '&startAfterId=' + startAfterId : '');
        const data = await ghlRequest(url);
        
        if (!data || typeof data !== 'object') {
          console.warn('Invalid response from GHL API, stopping pagination');
          break;
        }
        
        const batch = data?.contacts || [];
        if (!Array.isArray(batch)) {
          console.warn('Invalid contacts array from GHL API, stopping pagination');
          break;
        }
        
        contacts = contacts.concat(batch);
        // Stop when a page returns fewer than 100 or no results
        if (batch.length < 100) {
          hasMore = false;
        } else {
          startAfterId = batch[batch.length - 1].id;
        }
      } catch (paginationError) {
        console.error('Error during pagination:', paginationError);
        // Continue with whatever contacts we have so far
        break;
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

    // Recent contacts (last 10) - minimal data transfer
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

    const dashboardData = {
      totalContacts,
      totalVolunteers,
      totalDonors,
      totalVendors,
      totalCommunityMembers,
      recentContacts,
    };

    // Cache the result
    if (!(global as any).crmCache) {
      (global as any).crmCache = {};
    }
    (global as any).crmCache[CACHE_KEY] = {
      data: dashboardData,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      cached: false,
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
      vendorType, vendorFee, productsServices, sponsorshipInterest, additionalInfo,
      donationAmount, donationFrequency, anonymous, comments,
      paymentMethod, paymentIntentId, paymentStatus, transactionId,
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
    const ip = getClientIP(request);
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
      tags.push('katy-pride-celebration-2026');
    }

    // Build custom fields — scope donor fields to donor type only
    const customFields: Record<string, any> = {};
    if (availability) customFields.availability = availability;
    if (pronouns) customFields.pronouns = pronouns;
    if (type === 'donor') {
      if (donationFrequency) customFields.donation_frequency = donationFrequency;
      if (donationAmount) customFields.last_donation_amount = parseFloat(donationAmount);
      if (anonymous) customFields.anonymous = anonymous;
      if (comments) customFields.comments = comments;
    }
    // Legacy support for old field names
    if (type === 'donor' && frequency) customFields.donation_frequency = frequency;
    if (type === 'donor' && amount) customFields.last_donation_amount = amount;

    // Build address object with validation
    const contactAddress: Record<string, string> = {};
    if (address && typeof address === 'string' && address.trim().length > 0) {
      contactAddress.street = address.trim().substring(0, 200);
    }
    if (city && typeof city === 'string' && city.trim().length > 0) {
      contactAddress.city = city.trim().substring(0, 100);
    }
    if (state && typeof state === 'string' && state.trim().length > 0) {
      contactAddress.state = state.trim().substring(0, 50);
    }
    if (postalCode && typeof postalCode === 'string' && postalCode.trim().length > 0) {
      // Enhanced postal code validation supporting international formats
      const cleanPostalCode = postalCode.trim().replace(/[^0-9A-Z-\s]/g, '').substring(0, 20);
      
      // Support multiple postal code formats:
      // US: 12345 or 12345-6789
      // UK: SW1A 1AA, M1 1AA, B33 8TH
      // Canada: K1A 0A1, A1A 1A1
      // General: 3-10 alphanumeric characters with optional spaces/hyphens
      const postalCodePatterns = [
        /^\d{5}(-\d{4})?$/, // US ZIP+4
        /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/, // UK format
        /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/, // Canada format
        /^[A-Z0-9]{3,10}([-\s][A-Z0-9]{3,10})?$/ // General international
      ];
      
      const isValidPostalCode = postalCodePatterns.some(pattern => pattern.test(cleanPostalCode));
      
      if (isValidPostalCode) {
        contactAddress.postalCode = cleanPostalCode;
      } else {
        // Log warning but don't reject - allow admin to review
        console.warn('Postal code format may be invalid:', cleanPostalCode);
        contactAddress.postalCode = cleanPostalCode; // Still include for manual review
      }
    }

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
    
    // Add vendor details to contact note for visibility (enhanced sanitization)
    if (type === 'vendor' && productsServices) {
      const sanitizedVendorType = sanitizeText(vendorType || 'Not specified');
      const sanitizedProductsServices = sanitizeText(productsServices);
      const sanitizedAdditionalInfo = additionalInfo ? sanitizeText(additionalInfo) : '';
      
      contactPayload.contactNote = `Vendor Type: ${sanitizedVendorType}\nProducts/Services: ${sanitizedProductsServices}${sanitizedAdditionalInfo ? `\nAdditional Info: ${sanitizedAdditionalInfo}` : ''}`;
    }

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
