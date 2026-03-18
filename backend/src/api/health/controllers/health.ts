export default {
  async health(ctx) {
    try {
      const healthService = ctx.service('api::health.health');
      const [systemInfo, dbCheck] = await Promise.all([
        healthService.getSystemInfo(),
        healthService.checkDatabase()
      ]);

      const overallStatus = dbCheck.status === 'healthy' ? 'ok' : 'degraded';

      ctx.send({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        service: systemInfo.service,
        version: systemInfo.version,
        checks: {
          database: dbCheck,
          system: {
            status: 'healthy',
            uptime: systemInfo.uptime,
            memory: systemInfo.memory,
            nodeVersion: systemInfo.nodeVersion
          }
        }
      });
    } catch (error) {
      ctx.status = 503;
      ctx.send({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'katypride-strapi',
        error: 'Health check failed',
        message: error.message
      });
    }
  },
};
