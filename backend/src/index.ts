// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Enable public API access for specific content types
    strapi.server.use(async (ctx, next) => {
      const publicPaths = [
        '/api/events',
        '/api/resource-links', 
        '/api/carousel-images',
        '/api/calendar-settings'
      ];
      
      if (publicPaths.some(path => ctx.path.startsWith(path))) {
        ctx.state.auth = { isAuthenticated: false };
      }
      
      await next();
    });
  },
};
