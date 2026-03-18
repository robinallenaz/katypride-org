export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.health',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
