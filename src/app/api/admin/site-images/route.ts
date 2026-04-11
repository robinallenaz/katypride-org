import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { readData, writeData, type SiteImage } from '@/lib/data-service';
import { isValidImageUrl } from '@/lib/validation';
import { verifySession } from '../auth/route';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Predefined site image keys
const PREDEFINED_KEYS = [
  { key: 'board-photo', label: 'Board Photo', description: 'Photo displayed on the About page under "Our Board"' },
  { key: 'hero-home', label: 'Home Hero', description: 'Hero image for the homepage' },
  { key: 'about-hero', label: 'About Hero', description: 'Hero image for the About page' },
];

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

// Enhanced text sanitization to prevent XSS
function sanitizeText(text: string | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')  // Must be first to avoid double-encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 1000);
}

const VALID_GRAVITIES = ['auto', 'face', 'center', 'north', 'south', 'north_west', 'north_east', 'south_west', 'south_east'] as const;

function sanitizeSiteImage(image: Partial<SiteImage>): SiteImage {
  const gravity = image.gravity && VALID_GRAVITIES.includes(image.gravity as typeof VALID_GRAVITIES[number])
    ? image.gravity
    : 'auto';

  const url = typeof image.url === 'string' ? image.url.trim() : '';
  const cloudinaryPublicId = typeof image.cloudinaryPublicId === 'string'
    ? image.cloudinaryPublicId.trim().substring(0, 500)
    : undefined;

  return {
    id: String(image.id || '').trim(),
    key: String(image.key || '').trim(),
    url: url || '/placeholder.jpg',
    alt: sanitizeText(image.alt) || 'Image',
    caption: sanitizeText(image.caption),
    updatedAt: image.updatedAt || new Date().toISOString(),
    cloudinaryPublicId,
    gravity,
  };
}

function validateSiteImage(image: Partial<SiteImage>): { valid: boolean; error?: string } {
  if (!image.id || typeof image.id !== 'string') {
    return { valid: false, error: 'Invalid image ID' };
  }
  if (!image.key || typeof image.key !== 'string') {
    return { valid: false, error: 'Image key is required' };
  }
  if (!image.url || typeof image.url !== 'string' || image.url.trim().length === 0) {
    return { valid: false, error: 'Image URL is required' };
  }
  if (!isValidImageUrl(image.url.trim())) {
    return { valid: false, error: 'Invalid image URL. Must be HTTPS or a relative path.' };
  }
  if (!image.alt || typeof image.alt !== 'string') {
    return { valid: false, error: 'Alt text is required' };
  }
  return { valid: true };
}

export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const data = await readData<{ images: SiteImage[] }>('site-images');
    const images = data.images || [];

    // If key is provided, return specific image or null
    if (key) {
      const image = images.find(img => img.key === key);
      return NextResponse.json({ image: image || null });
    }

    // Return all images with predefined keys merged in
    const mergedImages = PREDEFINED_KEYS.map(predef => {
      const existing = images.find(img => img.key === predef.key);
      return existing || {
        id: predef.key,
        key: predef.key,
        url: '',
        alt: predef.label,
        caption: predef.description,
        updatedAt: undefined,
      };
    });

    return NextResponse.json({ 
      images: mergedImages,
      predefinedKeys: PREDEFINED_KEYS 
    });
  } catch (error) {
    console.error('Error reading site images:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const body: Partial<SiteImage> = await request.json();
    
    const validation = validateSiteImage(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const image = sanitizeSiteImage({
      ...body,
      updatedAt: new Date().toISOString(),
    });
    
    const data = await readData<{ images: SiteImage[] }>('site-images');
    
    const existingIndex = data.images.findIndex(i => i.key === image.key);
    const existingImage = existingIndex >= 0 ? data.images[existingIndex] : null;

    // If replacing an uploaded image, clean up the old Cloudinary asset.
    if (
      existingImage?.cloudinaryPublicId &&
      image.cloudinaryPublicId &&
      existingImage.cloudinaryPublicId !== image.cloudinaryPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(existingImage.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete replaced image from Cloudinary:', cloudinaryError);
      }
    }

    if (existingIndex >= 0) {
      data.images[existingIndex] = image;
    } else {
      data.images.push(image);
    }
    
    await writeData('site-images', data);
    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Error saving site image:', error);
    return NextResponse.json({ success: false, error: 'Failed to save image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'No key provided' }, { status: 400 });
    }

    const data = await readData<{ images: SiteImage[] }>('site-images');
    const imageToDelete = data.images.find(i => i.key === key);

    // Delete from Cloudinary if there's a publicId
    if (imageToDelete?.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with local deletion even if Cloudinary fails
      }
    }

    data.images = data.images.filter(i => i.key !== key);

    await writeData('site-images', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site image:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 });
  }
}
