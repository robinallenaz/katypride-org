import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, type CarouselImage } from '@/lib/data-service';
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

function sanitizeImage(image: Partial<CarouselImage>): CarouselImage {
  return {
    id: String(image.id || '').trim(),
    url: sanitizeText(image.url) || '/placeholder.jpg',
    alt: sanitizeText(image.alt) || 'Image',
    caption: sanitizeText(image.caption),
  };
}

function validateImage(image: Partial<CarouselImage>): { valid: boolean; error?: string } {
  if (!image.id || typeof image.id !== 'string') {
    return { valid: false, error: 'Invalid image ID' };
  }
  if (!image.url || typeof image.url !== 'string' || image.url.trim().length === 0) {
    return { valid: false, error: 'Image URL is required' };
  }
  if (!image.alt || typeof image.alt !== 'string') {
    return { valid: false, error: 'Alt text is required' };
  }
  return { valid: true };
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
    const data = await readData<{ images: CarouselImage[] }>('carousel');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading carousel:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const body: Partial<CarouselImage> & { images?: CarouselImage[] } = await request.json();
    
    // Handle bulk reorder update
    if ('images' in body && Array.isArray(body.images)) {
      const sanitizedImages = body.images.map(img => sanitizeImage(img));
      await writeData('carousel', { images: sanitizedImages });
      return NextResponse.json({ success: true });
    }
    
    // Handle single image update
    const validation = validateImage(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const image = sanitizeImage(body);
    const data = await readData<{ images: CarouselImage[] }>('carousel');
    
    const existingIndex = data.images.findIndex(i => i.id === image.id);
    if (existingIndex >= 0) {
      data.images[existingIndex] = image;
    } else {
      data.images.push(image);
    }
    
    await writeData('carousel', data);
    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ success: false, error: 'Failed to save image' }, { status: 500 });
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
    
    const data = await readData<{ images: CarouselImage[] }>('carousel');
    data.images = data.images.filter(i => i.id !== id);
    
    await writeData('carousel', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 });
  }
}
