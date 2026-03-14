import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'telemetry': {
    enabled: false,
  },
  'upload': {
    config: {
      provider: 'local',
      providerOptions: {},
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
