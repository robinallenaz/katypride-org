import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, createEvent, type Event } from '@/lib/data-service';
import { verifySession } from '../auth/route';

// Enhanced text sanitization to prevent XSS
function sanitizeText(text: string | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;')
    .trim()
    .substring(0, 1000);
}

function validateEvent(event: Partial<Event>): { valid: boolean; error?: string } {
  // id is optional for new events (server/DB assigns it via SERIAL).
  // For updates, id will be present and must be a string.
  if (event.id !== undefined && typeof event.id !== 'string') {
    return { valid: false, error: 'Invalid event ID' };
  }
  if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
    return { valid: false, error: 'Event title is required' };
  }
  if (!event.start || isNaN(Date.parse(event.start))) {
    return { valid: false, error: 'Valid start date is required' };
  }
  if (event.end && isNaN(Date.parse(event.end))) {
    return { valid: false, error: 'Invalid end date' };
  }
  if (!event.eventCategory || typeof event.eventCategory !== 'string') {
    return { valid: false, error: 'Event category is required' };
  }
  if (!event.imageAlt || typeof event.imageAlt !== 'string') {
    return { valid: false, error: 'Image alt text is required' };
  }
  return { valid: true };
}

const VALID_EVENT_CATEGORIES = ['general', 'coffee', 'social', 'fundraising', 'advocacy', 'education', 'health', 'youth', 'pride', 'volunteer', 'cultural', 'community'] as const;
type EventCategory = typeof VALID_EVENT_CATEGORIES[number];

function sanitizeEvent(event: Partial<Event>): Event {
  const category = String(event.eventCategory || 'general');
  const validCategory = VALID_EVENT_CATEGORIES.includes(category as EventCategory) 
    ? category as EventCategory 
    : 'general';
  
  // Only keep id if it's a non-empty integer string (existing DB row).
  // New events should pass through with id=''; the DB assigns a SERIAL id.
  const rawId = String(event.id || '').trim();
  const safeId = /^\d+$/.test(rawId) ? rawId : '';

  return {
    id: safeId,
    title: sanitizeText(event.title),
    start: event.start || new Date().toISOString(),
    end: event.end && !isNaN(Date.parse(event.end)) ? event.end : undefined,
    location: sanitizeText(event.location),
    imageSrc: sanitizeText(event.imageSrc),
    imageAlt: sanitizeText(event.imageAlt) || 'Event image',
    eventCategory: validCategory,
    externalUrl: sanitizeText(event.externalUrl),
    externalCtaLabel: sanitizeText(event.externalCtaLabel),
    summary: sanitizeText(event.summary),
  };
}

// Helper to check authentication
function authenticate(request: NextRequest): { success: boolean; response?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;

  if (!verifySession(token)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  return { success: true };
}

export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const data = await readData<{ events: Event[] }>('events');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading events:', error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const rawEvent: Partial<Event> = await request.json();
    console.log('[Events API] Received event:', JSON.stringify(rawEvent, null, 2));
    
    // Validate input
    const validation = validateEvent(rawEvent);
    if (!validation.valid) {
      console.error('[Events API] Validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Sanitize input
    const event = sanitizeEvent(rawEvent);
    console.log('[Events API] Sanitized event:', JSON.stringify(event, null, 2));

    // New event: no id present → let DB assign one via SERIAL.
    if (!event.id) {
      const created = await createEvent(event);
      console.log('[Events API] Created new event with id:', created.id);
      return NextResponse.json({ success: true, event: created });
    }

    // Existing event: upsert via the rewrite-all path.
    const data = await readData<{ events: Event[] }>('events');
    console.log('[Events API] Read existing events count:', data.events.length);

    const existingIndex = data.events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      data.events[existingIndex] = event;
      console.log('[Events API] Updated existing event at index:', existingIndex);
    } else {
      // Client provided an id we don't have a record of — treat as a new insert
      // rather than trusting the client-supplied id (which may overflow int4).
      const created = await createEvent({ ...event, id: undefined });
      console.log('[Events API] Created new event (client id ignored), id:', created.id);
      return NextResponse.json({ success: true, event: created });
    }

    await writeData('events', data);
    console.log('[Events API] Successfully wrote events');
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('[Events API] Error saving event:', error);
    console.error('[Events API] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[Events API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ success: false, error: 'Failed to save event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });
    }
    
    const data = await readData<{ events: Event[] }>('events');
    data.events = data.events.filter(e => e.id !== id);
    
    await writeData('events', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
