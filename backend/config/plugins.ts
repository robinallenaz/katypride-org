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
});

export default config;
