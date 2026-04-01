import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';
import { ghlRequest, GHL_LOCATION_ID } from '@/lib/ghl';

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const CRM_ADMIN_SECRET = process.env.CRM_ADMIN_SECRET || '';
const ALLOWED_CONTACT_TYPES = ['volunteer', 'donor', 'community-member', 'vendor', 'sponsor'] as const;
const ALLOWED_VENDOR_TYPES = ['nonprofit', 'forprofit', 'food', 'political', 'government'] as const;
const ALLOWED_SPONSORSHIP_LEVELS = [
  'water-station', 'community', 'bronze', 'color-run', 'silver',
  'kids-dash', 'gold', 'presenting', 'custom',
] as const;
const ALLOWED_SPONSOR_EVENTS = [
  'chase-the-rainbow-5k-2026', 'katy-pride-celebration-2026',
] as const;
const ALLOWED_EXCLUSIVE_OPPORTUNITIES = [
  'entertainment', 'hospitality', 't-shirt', 'wifi-charging',
  'swag-bag', 'kid-zone',
] as const;

// Enhanced rate limiter with cleanup and better IP detection
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const MAX_RATE_LIMIT_ENTRIES = 1000; // Prevent memory exhaustion
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;
let cleanupInitialized = false;

// Initialize cleanup interval only when needed
const initializeCleanupInterval = () => {
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
  }, 300_000); // 5 minutes
};

// Ensure cleanup interval is initialized only when needed
const ensureCleanupInitialized = () => {
  if (!cleanupInitialized) {
    initializeCleanupInterval();
    initializeRateLockCleanup(); // Also initialize rate lock cleanup
    cleanupInitialized = true;
  }
};

// Enhanced rate limiting with atomic operations using Map-based locking
const rateLimitLock = new Map<string, { locked: boolean; timestamp: number }>();

// Cleanup stale rate limit locks periodically
const RATE_LOCK_CLEANUP_INTERVAL = 300_000; // 5 minutes
const RATE_LOCK_MAX_AGE = 60_000; // 1 minute

async function cleanupStaleRateLocks(): Promise<void> {
  const now = Date.now();
  const staleLocks: string[] = [];
  
  for (const [ip, lock] of rateLimitLock.entries()) {
    if (now - lock.timestamp > RATE_LOCK_MAX_AGE) {
      staleLocks.push(ip);
    }
  }
  
  staleLocks.forEach(ip => rateLimitLock.delete(ip));
}

// Initialize rate lock cleanup
let rateLockCleanupInterval: NodeJS.Timeout | null = null;

const initializeRateLockCleanup = () => {
  if (rateLockCleanupInterval) return;
  
  rateLockCleanupInterval = setInterval(() => {
    cleanupStaleRateLocks();
  }, RATE_LOCK_CLEANUP_INTERVAL);
};

// Cleanup on process exit
process.on('beforeExit', () => {
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
  }
});

process.on('SIGINT', () => {
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
  }
});

process.on('SIGTERM', () => {
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
  }
});

function acquireLock(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitLock.get(ip);
  
  // Clean up expired lock
  if (existing && (now - existing.timestamp > RATE_LOCK_MAX_AGE)) {
    rateLimitLock.delete(ip);
  }
  
  // Check if already locked
  if (rateLimitLock.has(ip)) {
    return false; // Already locked
  }
  
  // Acquire lock atomically
  rateLimitLock.set(ip, { locked: true, timestamp: now });
  
  // Auto-release after 100ms
  setTimeout(() => {
    rateLimitLock.delete(ip);
  }, 100);
  
  return true; // Lock acquired
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  const newCount = entry.count + 1;
  entry.count = newCount;
  return newCount > RATE_LIMIT_MAX;
}

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

// Cache validation helper function
function validateCacheEntry(entry: any, now: number, maxAge: number): boolean {
  return entry && 
         typeof entry === 'object' && 
         typeof entry.timestamp === 'number' &&
         typeof entry.data === 'object' &&
         (now - entry.timestamp) < maxAge;
}

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


// Critical environment variable validation with production-safe error handling
if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  const errorMsg = process.env.NODE_ENV === 'production' 
    ? '[CRM] CRITICAL: CRM service configuration missing' 
    : '[CRM] CRITICAL: GHL_API_KEY or GHL_LOCATION_ID is not set — CRM functionality will fail';
  console.error(errorMsg);
  
  if (process.env.NODE_ENV === 'production') {
    console.error('[CRM] CRM functionality disabled until environment variables are configured');
  }
}
if (!CRM_ADMIN_SECRET) {
  const errorMsg = process.env.NODE_ENV === 'production'
    ? '[CRM] CRITICAL: Admin dashboard configuration missing'
    : '[CRM] CRITICAL: CRM_ADMIN_SECRET is not set — dashboard access will be blocked';
  console.error(errorMsg);
  
  if (process.env.NODE_ENV === 'production') {
    console.error('[CRM] Admin dashboard disabled until secret is configured');
  }
}

// Allowed interest values to prevent arbitrary tag injection
const ALLOWED_VOLUNTEER_INTERESTS = [
  'Event Planning', 'Community Outreach', 'Youth Programs', 'Fundraising',
  'Social Media', 'Administrative Support', 'Mentorship', 'Healthcare Support',
];
const ALLOWED_COMMUNITY_INTERESTS = [
  'LGBTQ+ Advocacy', 'Youth Support', 'Parent Resources', 'Ally Programs',
  'Education', 'Health & Wellness', 'Legal Support', 'Faith Communities',
  // Newsletter form interests
  'Events & Celebrations', 'Volunteer Opportunities', 'Advocacy & Education',
  'Community Support', 'Youth Programs', 'Fundraising & Donations',
  'Partnership Opportunities', 'Monthly Coffee Meetups',
  'Pride Nights at Momentum Climbing', 'Small Business Meet-Ups',
];

// Enhanced text sanitization to prevent XSS with comprehensive protection
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove HTML tags and script content
    .replace(/<\/?[^>]*>/gi, '')
    // Remove potentially dangerous characters
    .replace(/[<>"'`&]/g, '')
    // Remove JavaScript event handlers and protocols
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:(?:text\/html|application\/javascript|text\/css)/gi, '')
    // Remove dangerous protocols
    .replace(/vbscript:/gi, '')
    .replace(/file:\/\//gi, '')
    .replace(/ftp:\/\//gi, '')
    // Remove CSS expressions and imports (more specific)
    .replace(/expression\s*\(/gi, '')
    .replace(/@import\s+/gi, '')
    .replace(/style\s*=\s*["'][^"']*["']/gi, '')
    // Remove template literal patterns
    .replace(/\${[^}]*}/g, '')
    // Remove SVG and XML dangerous patterns
    .replace(/<\?xml[^>]*>/gi, '')
    .replace(/<svg[^>]*>/gi, '')
    .replace(/<script[^>]*>/gi, '')
    // Remove Unicode control characters and dangerous whitespace
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
    // Remove potential CSS injection (more specific)
    .replace(/url\s*\([^)]*\)/gi, '')
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

export async function GET(request: NextRequest) {
  // Ensure cleanup interval is initialized
  ensureCleanupInitialized();
  
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
    // Improved cache management with proper cleanup
    const CACHE_KEY = `crm_dashboard_data_${GHL_LOCATION_ID}`; // Include location ID to prevent collisions
    const CACHE_DURATION_MS = 300_000; // 5 minutes
    const MAX_CACHE_SIZE = 10; // Maximum number of cache entries
    const now = Date.now();
    
    // Initialize cache with proper structure and error handling
    try {
      if (!(global as any).crmCache) {
        (global as any).crmCache = new Map();
        (global as any).crmCacheMetadata = { 
          entries: new Map(), 
          lastCleanup: now 
        };
      }
    } catch (error) {
      console.error('Failed to initialize CRM cache:', error);
      // Fallback to in-memory cache if global fails
      const fallbackCache = new Map();
      const fallbackMetadata = { 
        entries: new Map(), 
        lastCleanup: now 
      };
      (global as any).crmCache = fallbackCache;
      (global as any).crmCacheMetadata = fallbackMetadata;
    }
    
    const cache = (global as any).crmCache as Map<string, any>;
    const cacheMetadata = (global as any).crmCacheMetadata;
    
    // Periodic cache cleanup with immediate cleanup if needed
    if (now - cacheMetadata.lastCleanup > 300_000 || cache.size > MAX_CACHE_SIZE * 1.5) {
      // Remove expired entries and cleanup metadata atomically
      const keysToDelete: string[] = [];
      
      for (const [key, value] of cache.entries()) {
        if (value && typeof value === 'object' && 'timestamp' in value && (now - value.timestamp) > CACHE_DURATION_MS) {
          keysToDelete.push(key);
        }
      }
      
      // Delete entries and metadata atomically
      keysToDelete.forEach(key => {
        cache.delete(key);
        cacheMetadata.entries.delete(key);
      });
      
      // Remove oldest entries if cache is too large
      if (cache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(cache.entries())
          .filter(([, value]) => value && typeof value === 'object' && 'timestamp' in value)
          .sort(([, a], [, b]) => a.timestamp - b.timestamp);
        
        const oldestKeys: string[] = [];
        while (entries.length > MAX_CACHE_SIZE) {
          const [oldestKey] = entries.shift()!;
          oldestKeys.push(oldestKey);
        }
        
        // Delete oldest entries and metadata atomically
        oldestKeys.forEach(key => {
          cache.delete(key);
          cacheMetadata.entries.delete(key);
        });
      }
      
      cacheMetadata.lastCleanup = now;
    }
    
    // Check cache with validation
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData && validateCacheEntry(cachedData, now, CACHE_DURATION_MS)) {
      // Validate cached data structure
      const { data } = cachedData;
      if (typeof data === 'object' && 
          typeof data.totalContacts === 'number' &&
          Array.isArray(data.recentContacts)) {
        return NextResponse.json({
          success: true,
          data: data,
          cached: true,
        });
      } else {
        // Invalid cache data, remove it immediately
        cache.delete(CACHE_KEY);
        cacheMetadata.entries.delete(CACHE_KEY);
      }
    }

    // Optimized pagination with streaming and memory management
    const MAX_PAGES = 10; // Further reduced for better performance
    const BATCH_SIZE = 50; // Smaller batches to reduce memory usage
    let totalContacts = 0;
    let totalVolunteers = 0;
    let totalDonors = 0;
    let totalVendors = 0;
    let totalCommunityMembers = 0;
    let recentContacts: any[] = [];
    
    let startAfterId = '';
    let hasMore = true;
    let page = 0;
    
    while (hasMore && page < MAX_PAGES) {
      page += 1;
      try {
        const url = '/contacts/?locationId=' + GHL_LOCATION_ID + '&limit=' + BATCH_SIZE
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
        
        // Process batch immediately to avoid memory buildup
        batch.forEach((contact: any) => {
          totalContacts++;
          
          // Count by tags
          if (contact.tags?.includes('volunteer')) totalVolunteers++;
          if (contact.tags?.includes('donor')) totalDonors++;
          if (contact.tags?.some((t: string) => t.startsWith('vendor'))) totalVendors++;
          if (contact.tags?.includes('community-member')) totalCommunityMembers++;
        });
        
        // Keep only recent contacts (last 10) to minimize memory with safe date parsing
        // Move parseDate function outside the sort for better performance
        const parseDate = (dateStr: string | undefined): number => {
          if (!dateStr) return 0;
          try {
            const parsed = new Date(dateStr).getTime();
            return isNaN(parsed) ? 0 : parsed;
          } catch {
            return 0;
          }
        };
        
        const allRecent = [...recentContacts, ...batch]
          .sort((a: any, b: any) => {
            try {
              const dateA = parseDate(a.dateAdded);
              const dateB = parseDate(b.dateAdded);
              return dateB - dateA; // Sort descending (newest first)
            } catch (error) {
              console.warn('Date parsing failed for contact sorting:', error);
              return 0; // Keep original order if date parsing fails
            }
          })
          .slice(0, 10)
          .map((c: any) => ({
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            email: c.email,
            tags: c.tags || [],
            dateAdded: c.dateAdded,
            company: c.companyName,
          }));
        
        recentContacts = allRecent;
        
        // Stop when a page returns fewer than BATCH_SIZE or no results
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        } else if (batch.length > 0) {
          const lastContact = batch[batch.length - 1];
          if (lastContact?.id && typeof lastContact.id === 'string') {
            startAfterId = lastContact.id;
          } else {
            console.warn('Last contact in batch missing valid ID, stopping pagination');
            hasMore = false;
          }
        } else {
          // Empty batch, stop pagination
          hasMore = false;
        }
      } catch (paginationError) {
        console.error('Error during pagination:', paginationError);
        // Continue with whatever data we have so far
        break;
      }
    }

    const dashboardData = {
      totalContacts,
      totalVolunteers,
      totalDonors,
      totalVendors,
      totalCommunityMembers,
      recentContacts,
    };

    // Cache the result with proper Map usage
    cache.set(CACHE_KEY, {
      data: dashboardData,
      timestamp: now,
    });
    
    // Update cache metadata
    cacheMetadata.entries.set(CACHE_KEY, now);

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
      // Sponsor-specific fields
      contactName, contactTitle, organizationName, organizationType,
      sponsorshipLevel, customSponsorshipAmount, interestedInExclusives, wantInvoice,
      event,
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

    // Rate-limit public form submissions with proper locking
    const ip = getClientIP(request);
    
    // Try to acquire lock - if failed, reject request
    if (!acquireLock(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many concurrent requests. Please try again.' },
        { status: 429 }
      );
    }
    
    // Check rate limit after acquiring lock
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
    // Enhanced postal code validation with stricter security and comprehensive patterns
    if (postalCode && typeof postalCode === 'string' && postalCode.trim().length > 0) {
      // Clean and validate postal code more strictly
      const cleanPostalCode = postalCode.trim()
        .replace(/[^0-9A-Z-\s]/g, '') // Remove special characters except letters, numbers, hyphens, spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
        .substring(0, 20); // Limit length
      
      // Comprehensive validation patterns with stricter matching
      const postalCodePatterns = [
        // US ZIP and ZIP+4 formats
        /^\d{5}(-\d{4})?$/,
        // UK postcode formats (more comprehensive)
        /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
        /^[A-Z]{1,2}\d{2}[A-Z]\s?\d[A-Z]{2}$/,
        // Canada format
        /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
        // Australian postcode
        /^\d{4}$/,
        // General international (more restrictive)
        /^[A-Z0-9]{3,10}([\-\s][A-Z0-9]{3,10})?$/
      ];
      
      const isValidPostalCode = postalCodePatterns.some(pattern => 
        pattern.test(cleanPostalCode) && cleanPostalCode.length >= 3
      );
      
      if (isValidPostalCode && cleanPostalCode.length >= 3) {
        contactAddress.postalCode = cleanPostalCode;
      } else {
        // Reject invalid postal codes and log for monitoring without exposing input
        console.warn('Invalid postal code format rejected');
        // Don't include invalid postal code - ensures data quality
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

    // Add sponsor details to contact note for visibility
    if (type === 'sponsor') {
      const sanitizedSponsorshipLevel = sanitizeText(sponsorshipLevel || 'Not specified');
      const sanitizedOrganizationType = sanitizeText(organizationType || 'Not specified');
      const sanitizedCustomAmount = customSponsorshipAmount ? sanitizeText(customSponsorshipAmount) : '';
      const sanitizedExclusives = interestedInExclusives && Array.isArray(interestedInExclusives) 
        ? interestedInExclusives.map(e => sanitizeText(e)).filter(Boolean).join(', ')
        : '';
      const sanitizedEvent = sanitizeText(event || 'General');
      
      let sponsorNote = `Sponsorship Level: ${sanitizedSponsorshipLevel}\nOrganization Type: ${sanitizedOrganizationType}\nEvent: ${sanitizedEvent}`;
      
      if (sanitizedCustomAmount) sponsorNote += `\nCustom Amount: ${sanitizedCustomAmount}`;
      if (sanitizedExclusives) sponsorNote += `\nExclusive Opportunities: ${sanitizedExclusives}`;
      if (wantInvoice) sponsorNote += '\nInvoice Requested: Yes';
      
      contactPayload.contactNote = sponsorNote;
      
      // Add sponsor-specific tags (validated against allowlists)
      tags.push('sponsor');
      if (sponsorshipLevel && (ALLOWED_SPONSORSHIP_LEVELS as readonly string[]).includes(sponsorshipLevel)) {
        tags.push(`sponsor-${sponsorshipLevel}`);
      }
      if (event) {
        const normalizedEvent = event.toLowerCase().replace(/\s+/g, '-');
        if ((ALLOWED_SPONSOR_EVENTS as readonly string[]).includes(normalizedEvent)) {
          tags.push(`event-${normalizedEvent}`);
        }
      }
      if (interestedInExclusives && Array.isArray(interestedInExclusives)) {
        interestedInExclusives.forEach((exclusive: string) => {
          if (exclusive && typeof exclusive === 'string' && (ALLOWED_EXCLUSIVE_OPPORTUNITIES as readonly string[]).includes(exclusive)) {
            tags.push(`exclusive-${exclusive}`);
          }
        });
      }
    }

    const contact = await ghlRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify(contactPayload),
    });

    return NextResponse.json({
      success: true,
      message: type === 'vendor'
        ? 'Thank you for your vendor application! A contract will be sent to your email after payment is processed.'
        : type === 'sponsor'
        ? 'Thank you for your sponsorship interest! We will contact you within 2 business days with next steps and payment information.'
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
