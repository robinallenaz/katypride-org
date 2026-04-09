import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';
import { ghlRequest, GHL_LOCATION_ID } from '@/lib/ghl';
import { readData, writeData } from '@/lib/data-service';

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const CRM_ADMIN_SECRET = process.env.CRM_ADMIN_SECRET || '';
const ALLOWED_CONTACT_TYPES = ['volunteer', 'donor', 'community-member', 'vendor', 'sponsor'] as const;
const ALLOWED_VENDOR_TYPES = ['nonprofit', 'forprofit', 'food', 'political', 'government'] as const;
const ALLOWED_SPONSORSHIP_LEVELS = [
  // 5K levels
  'water-station', 'community', 'bronze', 'color-run', 'silver',
  'kids-dash', 'gold', 'presenting', 'custom',
  // Celebration levels
  'friends', 'rainbow', 'platinum', 'title',
] as const;
const ALLOWED_SPONSOR_EVENTS = [
  'chase-the-rainbow-5k-2026', 'katy-pride-celebration-2026',
] as const;
const ALLOWED_EXCLUSIVE_OPPORTUNITIES = [
  'entertainment', 'hospitality', 't-shirt', 'wifi-charging',
  'swag-bag', 'kid-zone',
] as const;

// Cleanup stale rate limit locks periodically
const RATE_LOCK_CLEANUP_INTERVAL = 300_000; // 5 minutes
const RATE_LOCK_MAX_AGE = 60_000; // 1 minute

// Enhanced rate limiter with cleanup and better IP detection
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const MAX_RATE_LIMIT_ENTRIES = 1000; // Prevent memory exhaustion
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Fallback backup function to save form data locally if CRM fails
async function saveFormBackup(formData: any): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const backupEntry = {
      timestamp,
      ...formData,
      source: 'crm_fallback',
    };
    
    // Use the data service to append to a backup file
    const existing = await readData<{ submissions: any[] }>('form-backup');
    const submissions = existing?.submissions || [];
    submissions.push(backupEntry);
    
    // Keep only last 1000 submissions to prevent file bloat
    if (submissions.length > 1000) {
      submissions.splice(0, submissions.length - 1000);
    }
    
    await writeData('form-backup', { submissions });
    console.log('[CRM Fallback] Form data saved to backup:', timestamp);
  } catch (backupError) {
    console.error('[CRM Fallback] Failed to save backup:', backupError);
  }
}

// Cleanup interval reference - initialized once at module load
let cleanupInterval: NodeJS.Timeout | null = null;
let rateLockCleanupInterval: NodeJS.Timeout | null = null;

// Enhanced rate limiting with atomic operations using Map-based locking
const rateLimitLock = new Map<string, { locked: boolean; timestamp: number; timeoutId?: NodeJS.Timeout }>();

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

function acquireLock(ip: string): NodeJS.Timeout | null {
  const now = Date.now();
  const existing = rateLimitLock.get(ip);

  // Clean up expired lock (clear its timeout if present)
  if (existing && (now - existing.timestamp > RATE_LOCK_MAX_AGE)) {
    if (existing.timeoutId) {
      clearTimeout(existing.timeoutId);
    }
    rateLimitLock.delete(ip);
  }

  // If lock exists and hasn't expired, another request is in progress
  if (rateLimitLock.has(ip)) {
    return null;
  }

  // Create auto-release timeout
  const timeoutId = setTimeout(() => {
    rateLimitLock.delete(ip);
  }, RATE_LOCK_MAX_AGE);

  rateLimitLock.set(ip, { locked: true, timestamp: now, timeoutId });

  return timeoutId;
}

function releaseLock(ip: string, timeoutId: NodeJS.Timeout | null): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  rateLimitLock.delete(ip);
}

function checkAndIncrementRateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // New entry
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (now > entry.resetAt) {
    // Expired entry - delete and create new to prevent memory leak
    rateLimitMap.delete(ip);
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { limited: true, remaining: 0 };
  }

  entry.count += 1;
  return { limited: false, remaining: RATE_LIMIT_MAX - entry.count };
}


// Initialize cleanup intervals once at module load (not per-request)
function initializeCleanupIntervals(): void {
  if (cleanupInterval) return;
  
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

  // Rate lock cleanup interval
  rateLockCleanupInterval = setInterval(() => {
    cleanupStaleRateLocks();
  }, RATE_LOCK_CLEANUP_INTERVAL);
}

// Initialize immediately at module load
initializeCleanupIntervals();

// Cleanup interval on process exit
process.on('beforeExit', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
  }
});

process.on('SIGINT', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
  }
});

process.on('SIGTERM', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (rateLockCleanupInterval) {
    clearInterval(rateLockCleanupInterval);
    rateLockCleanupInterval = null;
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

// Safely extract contact ID from various GHL API response formats
function extractContactId(response: any): string | undefined {
  if (!response || typeof response !== 'object') return undefined;
  // Try nested format: { contact: { id: ... } }
  if (response.contact?.id) return String(response.contact.id);
  // Try flat format: { id: ... }
  if (response.id) return String(response.id);
  // Try alternative format: { contactId: ... }
  if (response.contactId) return String(response.contactId);
  return undefined;
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
  // Cleanup intervals are initialized at module load
  
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
        (global as any).crmCacheLastCleanup = now;
      }
    } catch (error) {
      console.error('Failed to initialize CRM cache:', error);
      // Fallback to in-memory cache if global fails
      (global as any).crmCache = new Map();
      (global as any).crmCacheLastCleanup = now;
    }

    const cache = (global as any).crmCache as Map<string, any>;
    let lastCleanup = (global as any).crmCacheLastCleanup as number;

    // Periodic cache cleanup with immediate cleanup if needed
    if (now - lastCleanup > 300_000 || cache.size > MAX_CACHE_SIZE * 1.5) {
      // Remove expired entries
      const keysToDelete: string[] = [];

      for (const [key, value] of cache.entries()) {
        if (value && typeof value === 'object' && 'timestamp' in value && (now - value.timestamp) > CACHE_DURATION_MS) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => cache.delete(key));

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

        oldestKeys.forEach(key => cache.delete(key));
      }

      (global as any).crmCacheLastCleanup = now;
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
    let totalSponsors = 0;
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
          if (contact.tags?.includes('sponsor') || contact.tags?.some((t: string) => t.startsWith('sponsor-'))) totalSponsors++;
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
            id: c.id,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            email: c.email,
            phone: c.phone,
            tags: c.tags || [],
            dateAdded: c.dateAdded,
            company: c.companyName,
            // Full address details
            address: c.address,
            // Custom fields for sponsors
            customFields: c.customFields || {},
            // Full contact note (contains sponsorship level, comments, etc.)
            contactNote: c.contactNote,
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
      totalSponsors,
      recentContacts,
    };

    // Cache the result with proper Map usage and immediate size enforcement
    // Remove oldest entries if at capacity before adding new one
    if (cache.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries())
        .filter(([, value]) => value && typeof value === 'object' && 'timestamp' in value)
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      // Remove oldest entry to make room
      if (entries.length > 0) {
        const [oldestKey] = entries[0];
        cache.delete(oldestKey);
      }
    }

    cache.set(CACHE_KEY, {
      data: dashboardData,
      timestamp: now,
    });

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
  // Capture body early so it's available in catch block for backup
  let requestBody: any;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Rate-limiting variables - declared outside try so finally can access them
  const ip = getClientIP(request);
  let lockTimeoutId: NodeJS.Timeout | null = null;

  try {
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
      source, // Track form source (e.g., 'Newsletter Signup')
      _gotcha, // honeypot field — bots fill this, real users don't see it
      // Vendor-specific fields
      agreeToTexts,
    } = requestBody;

    // Rate-limit public form submissions with atomic check-and-increment

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

    // Pre-validate sponsor data before rate limiting
    if (type === 'sponsor') {
      // Validate custom sponsorship amount is numeric when level is 'custom'
      if (sponsorshipLevel === 'custom' && customSponsorshipAmount) {
        const parsedCustomAmount = parseFloat(customSponsorshipAmount);
        if (isNaN(parsedCustomAmount) || parsedCustomAmount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid custom sponsorship amount. Please enter a valid positive number.' },
            { status: 400 }
          );
        }
      }
    }

    // Pre-validate vendor type before rate limiting
    if (vendorType && !ALLOWED_VENDOR_TYPES.includes(vendorType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vendor type' },
        { status: 400 }
      );
    }

    // Try to acquire lock - if failed, reject request (another request is in progress)
    lockTimeoutId = acquireLock(ip);
    if (!lockTimeoutId) {
      return NextResponse.json(
        { success: false, error: 'Too many concurrent requests. Please try again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Check rate limit atomically while holding the lock
    const rateLimitResult = checkAndIncrementRateLimit(ip);
    
    // ALWAYS release lock after rate check - don't hold it during CRM processing
    releaseLock(ip, lockTimeoutId);
    lockTimeoutId = null;
    
    if (rateLimitResult.limited) {
      const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // Build tags — only allow known interest values to prevent tag injection
    let tags: string[] = [type];

    // Add sponsor-specific tags immediately if type is sponsor
    // Note: base 'sponsor' tag is already added via [type] above
    if (type === 'sponsor') {
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
    
    if (interests && Array.isArray(interests)) {
      const allowed = type === 'volunteer' ? ALLOWED_VOLUNTEER_INTERESTS
        : type === 'community-member' ? ALLOWED_COMMUNITY_INTERESTS
        : [];
      const safeInterests = interests.filter((i: string) => allowed.includes(i));
      tags.push(...safeInterests);
    }
    if (vendorType) {
      tags.push(`vendor-${vendorType}`);
      // Only add celebration tag for vendors registering for that specific event
      // Vendors for the 5K should NOT get this tag
      if (event === 'katy-pride-celebration-2026') {
        tags.push('katy-pride-celebration-2026');
      }
    }

    // Build custom fields — scope donor fields to donor type only
    const customFields: Record<string, any> = {};
    if (availability) customFields.availability = availability;
    if (pronouns) customFields.pronouns = pronouns;
    if (type === 'donor') {
      if (donationFrequency) customFields.donation_frequency = donationFrequency;
      if (type === 'donor' && donationAmount) {
        const parsedAmount = parseFloat(donationAmount);
        if (!isNaN(parsedAmount)) {
          customFields.last_donation_amount = parsedAmount;
        }
      }
      if (anonymous) customFields.anonymous = anonymous;
      if (comments) customFields.comments = comments;
      // Legacy support for old field names with NaN validation
      if (type === 'donor' && frequency) customFields.donation_frequency = frequency;
      if (type === 'donor' && amount) {
        const parsedAmount = parseFloat(amount);
        if (!isNaN(parsedAmount)) {
          customFields.last_donation_amount = parsedAmount;
        }
      }
    }
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

    // Check if contact already exists to prevent tag merging issues and preserve note history
    let existingContactId: string | null = null;
    let existingTags: string[] = [];
    let existingContactNote: string | null = null;
    
    try {
      const searchUrl = `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}&limit=1`;
      const searchResult = await ghlRequest(searchUrl);
      
      if (searchResult?.contacts && searchResult.contacts.length > 0) {
        const existingContact = searchResult.contacts.find((c: any) => 
          c.email?.toLowerCase() === email.toLowerCase()
        );
        
        if (existingContact) {
          existingContactId = existingContact.id;
          existingTags = existingContact.tags || [];
          existingContactNote = existingContact.contactNote || existingContact.note || null;
          
          // Remove old dynamic tags to prevent double-tagging and accumulation
          // Use base prefixes to match both exact tags and suffixed variants
          const dynamicTagBases = [
            'vendor',
            'sponsor',
            'event',
            'exclusive',
          ];
          
          // Also remove generic dynamic tags
          const genericDynamicTags = ['katy-pride-celebration-2026', 'chase-the-rainbow-5k-2026'];
          
          const cleanedTags = existingTags.filter((tag: string) => {
            // Keep tag if it doesn't start with dynamic base prefix and isn't in generic list
            // Note: We use startsWith only, NOT exact match (tag === base), to preserve base tags
            const isDynamic = dynamicTagBases.some(base => tag.startsWith(`${base}-`));
            const isGenericDynamic = genericDynamicTags.includes(tag);
            return !isDynamic && !isGenericDynamic;
          });
          
          // Merge cleaned existing tags with new tags (avoiding duplicates)
          tags = [...new Set([...cleanedTags, ...tags])];
        }
      }
    } catch (searchError) {
      console.warn('Could not search for existing contact:', searchError);
      // Continue with create flow
    }

    // Create contact in GrowthSphere360
    const contactPayload: Record<string, any> = {
      locationId: GHL_LOCATION_ID,
      name,
      email,
      phone,
      tags,
      customFields,
    }
    if (company) contactPayload.companyName = company;
    if (Object.keys(contactAddress).length > 0) contactPayload.address = contactAddress;

    // Add contact notes based on type - prepend new submission to preserve existing history
    if (type === 'community-member') {
      const sanitizedSource = source ? sanitizeText(source) : 'Website Form';
      const interestList = interests && Array.isArray(interests) && interests.length > 0 
        ? interests.join(', ')
        : 'None specified';
      
      const communityNote = `Source: ${sanitizedSource}\nInterests: ${interestList}`;
      
      // Prepend new submission to existing note to preserve history
      const MAX_NOTE_LENGTH = 5000;
      const fullNote = existingContactNote
        ? `${communityNote}\n\n---\nPrevious Submissions:\n${existingContactNote}`
        : communityNote;
      contactPayload.contactNote = fullNote.substring(0, MAX_NOTE_LENGTH);
    }

    if (type === 'volunteer') {
      const sanitizedSource = source ? sanitizeText(source) : 'Website Form';
      const interestList = interests && Array.isArray(interests) && interests.length > 0 
        ? interests.join(', ')
        : 'None specified';
      const availabilityInfo = availability ? sanitizeText(availability) : 'Not specified';
      
      const volunteerNote = `Source: ${sanitizedSource}\nInterests: ${interestList}\nAvailability: ${availabilityInfo}`;
      
      // Prepend new submission to existing note to preserve history
      const MAX_NOTE_LENGTH = 5000;
      const fullNote = existingContactNote
        ? `${volunteerNote}\n\n---\nPrevious Submissions:\n${existingContactNote}`
        : volunteerNote;
      contactPayload.contactNote = fullNote.substring(0, MAX_NOTE_LENGTH);
    }

    if (type === 'sponsor') {
      const sanitizedSponsorshipLevel = sanitizeText(sponsorshipLevel || 'Not specified');
      const sanitizedOrganizationType = sanitizeText(organizationType || 'Not specified');
      const sanitizedCustomAmount = customSponsorshipAmount ? sanitizeText(customSponsorshipAmount) : '';
      const sanitizedExclusives = interestedInExclusives && Array.isArray(interestedInExclusives)
        ? interestedInExclusives.map(e => sanitizeText(e)).filter(Boolean).join(', ')
        : '';
      const sanitizedEvent = sanitizeText(event || 'General');
      const sanitizedComments = requestBody.additionalComments ? sanitizeText(requestBody.additionalComments) : '';

      let sponsorNote = `Sponsorship Level: ${sanitizedSponsorshipLevel}\nOrganization Type: ${sanitizedOrganizationType}\nEvent: ${sanitizedEvent}`;

      if (sanitizedCustomAmount) sponsorNote += `\nCustom Amount: ${sanitizedCustomAmount}`;
      if (sanitizedExclusives) sponsorNote += `\nExclusive Opportunities: ${sanitizedExclusives}`;
      if (wantInvoice) sponsorNote += '\nInvoice Requested: Yes';
      if (sanitizedComments) sponsorNote += `\n\nAdditional Comments:\n${sanitizedComments}`;

      // Prepend new submission to existing note to preserve history
      const MAX_NOTE_LENGTH = 5000;
      const fullNote = existingContactNote
        ? `${sponsorNote}\n\n---\nPrevious Submissions:\n${existingContactNote}`
        : sponsorNote;
      contactPayload.contactNote = fullNote.substring(0, MAX_NOTE_LENGTH);
    }

    if (type === 'vendor') {
      const sanitizedVendorType = sanitizeText(vendorType || 'Not specified');
      const sanitizedProductsServices = sanitizeText(productsServices || '');
      const sanitizedAdditionalInfo = additionalInfo ? sanitizeText(additionalInfo) : '';
      const sanitizedWebsite = website ? sanitizeText(website) : '';
      const sanitizedSocialMedia = socialMedia ? sanitizeText(socialMedia) : '';
      const sponsorshipInterestInfo = sponsorshipInterest ? 'Yes' : 'No';
      const sanitizedPaymentStatus = sanitizeText(paymentStatus || 'pending');
      const vendorFeeAmount = vendorFee != null ? `$${vendorFee}` : 'Not specified';

      let vendorNote = `Vendor Type: ${sanitizedVendorType}\nProducts/Services: ${sanitizedProductsServices}\nVendor Fee: ${vendorFeeAmount}`;

      if (sanitizedWebsite) vendorNote += `\nWebsite: ${sanitizedWebsite}`;
      if (sanitizedSocialMedia) vendorNote += `\nSocial Media: ${sanitizedSocialMedia}`;
      if (sanitizedAdditionalInfo) vendorNote += `\nAdditional Info: ${sanitizedAdditionalInfo}`;
      vendorNote += `\nInterested in Sponsorship: ${sponsorshipInterestInfo}`;
      vendorNote += `\nPayment Status: ${sanitizedPaymentStatus}`;
      if (agreeToTexts) vendorNote += '\nAgreed to Text Updates: Yes';

      // Prepend new submission to existing note to preserve history
      const MAX_NOTE_LENGTH = 5000;
      const fullNote = existingContactNote
        ? `${vendorNote}\n\n---\nPrevious Submissions:\n${existingContactNote}`
        : vendorNote;
      contactPayload.contactNote = fullNote.substring(0, MAX_NOTE_LENGTH);
    }
    
    let contact;
    
    if (existingContactId) {
      // Update existing contact
      contact = await ghlRequest(`/contacts/${existingContactId}`, {
        method: 'PUT',
        body: JSON.stringify(contactPayload),
      });
    } else {
      // Create new contact
      contact = await ghlRequest('/contacts/', {
        method: 'POST',
        body: JSON.stringify(contactPayload),
      });
    }

    // Backup successful submission for audit trail
    try {
      await saveFormBackup({
        ...requestBody,
        crmSuccess: true,
        contactId: extractContactId(contact),
      });
    } catch (backupSaveError) {
      console.error('Failed to save success backup:', backupSaveError);
      // Non-fatal - don't fail the request if backup fails
    }

    return NextResponse.json({
      success: true,
      message: type === 'vendor'
        ? 'Thank you for your vendor application! A contract will be sent to your email after payment is processed.'
        : type === 'sponsor'
        ? 'Thank you for your sponsorship interest! We will contact you within 2 business days with next steps and payment information.'
        : 'Thank you! Your information has been submitted successfully.',
      data: { contactId: extractContactId(contact) },
    });
  } catch (error) {
    console.error('CRM API Error:', error);
    
    // Save form data to backup if CRM fails (requestBody is already available)
    try {
      await saveFormBackup({
        ...requestBody,
        error: error instanceof Error ? error.message : 'Unknown error',
        crmSuccess: false,
      });
    } catch (backupSaveError) {
      console.error('Failed to save form backup:', backupSaveError);
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  } finally {
    // Always release the lock to prevent blocking legitimate users
    if (lockTimeoutId) {
      releaseLock(ip, lockTimeoutId);
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRM_ADMIN_SECRET || !token || !safeEqual(token, CRM_ADMIN_SECRET)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get contact ID from query params
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Delete contact from GrowthSphere360
    await ghlRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });

    // Clear the dashboard cache to reflect the deletion
    const CACHE_KEY = `crm_dashboard_data_${GHL_LOCATION_ID}`;
    if ((global as any).crmCache) {
      (global as any).crmCache.delete(CACHE_KEY);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('CRM Delete Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
