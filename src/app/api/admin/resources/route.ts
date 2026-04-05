import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, type Resource } from '@/lib/data-service';
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

function sanitizeUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const sanitized = url.trim();
  // Only allow http/https URLs
  if (!sanitized.match(/^https?:\/\//i)) {
    return '';
  }
  return sanitized.substring(0, 2000);
}

function validateResource(resource: Partial<Resource>): { valid: boolean; error?: string } {
  if (!resource.id || typeof resource.id !== 'string') {
    return { valid: false, error: 'Invalid resource ID' };
  }
  if (!resource.title || typeof resource.title !== 'string' || resource.title.trim().length === 0) {
    return { valid: false, error: 'Resource title is required' };
  }
  if (!resource.url || typeof resource.url !== 'string' || resource.url.trim().length === 0) {
    return { valid: false, error: 'Resource URL is required' };
  }
  if (!resource.category || typeof resource.category !== 'string') {
    return { valid: false, error: 'Resource category is required' };
  }
  // Validate URL format
  const urlPattern = /^https?:\/\/.+/i;
  if (!urlPattern.test(resource.url)) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }
  return { valid: true };
}

function sanitizeResource(resource: Partial<Resource>): Resource {
  return {
    id: String(resource.id || '').trim(),
    title: sanitizeText(resource.title),
    url: sanitizeUrl(resource.url),
    category: sanitizeText(resource.category) || 'General',
    description: sanitizeText(resource.description),
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
    const data = await readData<{ resources: Resource[] }>('resources');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading resources:', error);
    return NextResponse.json({ resources: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const rawResource: Partial<Resource> = await request.json();
    
    // Validate input
    const validation = validateResource(rawResource);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Sanitize input
    const resource = sanitizeResource(rawResource);
    
    // Reject if URL became empty after sanitization
    if (!resource.url) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format. URL must start with http:// or https://' },
        { status: 400 }
      );
    }
    
    const data = await readData<{ resources: Resource[] }>('resources');
    
    const existingIndex = data.resources.findIndex(r => r.id === resource.id);
    if (existingIndex >= 0) {
      data.resources[existingIndex] = resource;
    } else {
      data.resources.push(resource);
    }
    
    await writeData('resources', data);
    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error('Error saving resource:', error);
    return NextResponse.json({ success: false, error: 'Failed to save resource' }, { status: 500 });
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
    
    const data = await readData<{ resources: Resource[] }>('resources');
    data.resources = data.resources.filter(r => r.id !== id);
    
    await writeData('resources', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete resource' }, { status: 500 });
  }
}
