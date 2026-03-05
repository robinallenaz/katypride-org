export default {
  routes: [
    // Contact management
    {
      method: 'POST',
      path: '/contacts',
      handler: 'growthsphere.createContact',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/contacts/:contactId',
      handler: 'growthsphere.getContact',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/contacts/search',
      handler: 'growthsphere.searchContacts',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Volunteer management
    {
      method: 'POST',
      path: '/volunteers',
      handler: 'growthsphere.addVolunteer',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Donor management
    {
      method: 'POST',
      path: '/donors',
      handler: 'growthsphere.addDonor',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Community member management
    {
      method: 'POST',
      path: '/community-members',
      handler: 'growthsphere.addCommunityMember',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Opportunity management
    {
      method: 'GET',
      path: '/opportunities',
      handler: 'growthsphere.getOpportunities',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Pipeline management
    {
      method: 'GET',
      path: '/pipelines',
      handler: 'growthsphere.getPipelines',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/pipelines/:pipelineId/stages',
      handler: 'growthsphere.getPipelineStages',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Communication
    {
      method: 'POST',
      path: '/notes',
      handler: 'growthsphere.addNote',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/emails',
      handler: 'growthsphere.sendEmail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sms',
      handler: 'growthsphere.sendSMS',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Analytics
    {
      method: 'GET',
      path: '/analytics',
      handler: 'growthsphere.getAnalytics',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Webhook handler
    {
      method: 'POST',
      path: '/webhook',
      handler: 'growthsphere.handleWebhook',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
