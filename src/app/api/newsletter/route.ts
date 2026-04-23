import { NextRequest, NextResponse } from 'next/server';

interface NewsletterSignupRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

// Simple in-memory rate limiter (per IP)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body: NewsletterSignupRequest = await request.json();
    
    // Validate required fields with proper email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate name lengths to prevent abuse
    const MAX_NAME_LENGTH = 100;
    if (body.firstName && body.firstName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: 'First name is too long' },
        { status: 400 }
      );
    }
    if (body.lastName && body.lastName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: 'Last name is too long' },
        { status: 400 }
      );
    }

    // Log the signup
    console.log('Newsletter signup received:', {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      timestamp: new Date().toISOString(),
    });

    // Also send to CRM (GrowthSphere360/GHL) for unified contact management
    try {
      const crmPayload = {
        type: 'community-member' as const,
        name: `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.email,
        email: body.email,
        source: 'Newsletter Signup (Fallback Form)',
        interests: ['newsletter'],
        _gotcha: '',
      };

      const crmResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://katypride.org'}/api/crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmPayload),
      });

      if (!crmResponse.ok) {
        console.error('CRM sync failed for newsletter signup:', await crmResponse.text());
      }
    } catch (crmError) {
      // Don't fail the signup if CRM sync fails
      console.error('CRM sync error:', crmError);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
