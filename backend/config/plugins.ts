import type { Core } from '@strapi/strapi';

// Validate Cloudinary environment variables
const cloudName = process.env.CLOUDINARY_NAME;
const cloudKey = process.env.CLOUDINARY_KEY;
const cloudSecret = process.env.CLOUDINARY_SECRET;

if (process.env.NODE_ENV === 'production') {
  if (!cloudName || !cloudKey || !cloudSecret) {
    console.error('[CRITICAL] Cloudinary environment variables are not configured:');
    console.error('  - CLOUDINARY_NAME:', cloudName ? '✓' : '✗ MISSING');
    console.error('  - CLOUDINARY_KEY:', cloudKey ? '✓' : '✗ MISSING');
    console.error('  - CLOUDINARY_SECRET:', cloudSecret ? '✓' : '✗ MISSING');
  }
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'telemetry': {
    enabled: false,
  },
  'upload': {
    config: {
      // Only use Cloudinary if all credentials are configured; otherwise fall back to local
      provider: (cloudName && cloudKey && cloudSecret) ? 'cloudinary' : 'local',
      ...(cloudName && cloudKey && cloudSecret && {
        providerOptions: {
          cloud_name: cloudName,
          api_key: cloudKey,
          api_secret: cloudSecret,
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      }),
      sizeLimit: 10000000, // 10MB
    },
  },
  cors: {
    config: {
      origin: [
        'http://localhost:3000',  // Next.js development
        'http://localhost:3001',  // Alternative Next.js port
        'https://katypride-7x4qno1sj-robinallenazs-projects.vercel.app',  // Production Vercel
        'https://katypride.org',  // Production domain
        'https://www.katypride.org',  // Production domain with www
        'https://katypride-strapi.onrender.com',  // Strapi on Render
        // Allow all localhost origins for development
        /^http:\/\/localhost:\d+$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    },
  },
});

export default config;
