'use strict';

/**
 * health-check controller
 */

module.exports = {
  async index(ctx) {
    ctx.type = 'application/json';
    
    try {
      // Check database connection using Strapi v5 API
      await strapi.db.query.raw('SELECT 1');
      
      ctx.status = 200;
      ctx.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: strapi.config.info.version,
        environment: strapi.config.environment
      });
    } catch (error) {
      strapi.log.error('Health check failed:', error);
      
      ctx.status = 503;
      ctx.send({
        status: 'error',
        message: 'Service unavailable',
        timestamp: new Date().toISOString(),
        version: strapi.config.info.version,
        environment: strapi.config.environment
      });
    }
  }
};
