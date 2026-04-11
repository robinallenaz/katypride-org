import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifySession } from '../auth/route';
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/validation';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export async function POST(request: NextRequest) {
  // Verify admin session
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const formData = await request.formData();
    const fileField = formData.get('file');
    const ALLOWED_FOLDERS = ['katypride/carousel', 'katypride/site-images'];
    const requestedFolder = formData.get('folder') as string;
    const folder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'katypride/carousel';

    if (!(fileField instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file upload. Please provide an image file.' },
        { status: 400 }
      );
    }

    const file = fileField;

    // Validate file type (MIME can be spoofed, also check extension)
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number]) ||
        !ALLOWED_IMAGE_EXTENSIONS.includes(ext as typeof ALLOWED_IMAGE_EXTENSIONS[number])) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary with best practices
    // Using unsigned upload with automatic optimizations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'image',
      // Auto quality and format for optimal delivery
      quality: 'auto:good',
      fetch_format: 'auto',
      // Enable responsive breakpoints generation
      responsive_breakpoints: [
        {
          create_derived: true,
          bytes_step: 20000,
          min_width: 200,
          max_width: 1920,
          max_images: 5,
        },
      ],
      // Add metadata for tracking
      context: {
        uploaded_at: new Date().toISOString(),
        source: 'katypride-admin',
      },
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
