export default {
  async checkDatabase() {
    try {
      // Test database connection using strapi instance
      const { strapi } = require('@strapi/strapi');
      await strapi.db.query('api::health.health').findOne();
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed', error: error.message };
    }
  },

  async getSystemInfo() {
    return {
      service: 'katypride-strapi',
      version: process.env.npm_package_version || 'unknown',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
};
