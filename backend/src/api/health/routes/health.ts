export default {
  type: 'admin',
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
