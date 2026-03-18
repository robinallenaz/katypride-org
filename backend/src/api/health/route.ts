// This file is deprecated - use controllers/health.ts instead
// Keeping this file for Strapi structure requirements
export default {
  async health(ctx) {
    // Delegate to the controller implementation
    const controller = require('./controllers/health').default;
    return controller.health(ctx);
  },
};
