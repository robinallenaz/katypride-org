// WARNING: Strapi v5 ignores this file. API routes are defined per-content-type
// in src/api/<name>/routes/<name>.ts. Public read access must be configured via
// the Strapi admin panel: Settings → Roles → Public → check "find"/"findOne"
// for each content type. This file is kept as documentation only.
export default {
  routes: [
    {
      method: 'GET',
      path: '/events',
      handler: 'event.find',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/events/:id',
      handler: 'event.findOne',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/resource-links',
      handler: 'resource-link.find',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/resource-links/:id',
      handler: 'resource-link.findOne',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/carousel-images',
      handler: 'carousel-image.find',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/carousel-images/:id',
      handler: 'carousel-image.findOne',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/calendar-settings',
      handler: 'calendar-settings.find',
      config: {
        policies: ['is-public'],
        middlewares: [],
      },
    },
  ],
};
