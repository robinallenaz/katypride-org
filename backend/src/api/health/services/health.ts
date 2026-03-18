export default {
  async checkDatabase() {
    try {
      // Test database connection using a simple query
      const { strapi } = require('@strapi/strapi');
      await strapi.db.connection.raw('SELECT 1');
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
