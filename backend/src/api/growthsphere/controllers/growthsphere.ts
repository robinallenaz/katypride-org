export default ({ strapi }: { strapi: any }) => ({
  // Contact endpoints
  async createContact(ctx) {
    try {
      const { name, email, phone, tags, customFields } = ctx.request.body;
      
      if (!email) {
        return ctx.badRequest('Email is required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const contact = await growthsphereService.createContact({
        name,
        email,
        phone,
        tags,
        customFields,
      });

      ctx.send({
        success: true,
        data: contact,
      });
    } catch (error) {
      ctx.badRequest('Failed to create contact', { error: error.message });
    }
  },

  async getContact(ctx) {
    try {
      const { contactId } = ctx.params;
      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const contact = await growthsphereService.getContact(contactId);

      ctx.send({
        success: true,
        data: contact,
      });
    } catch (error) {
      ctx.badRequest('Failed to get contact', { error: error.message });
    }
  },

  async searchContacts(ctx) {
    try {
      const { query } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const contacts = await growthsphereService.searchContacts(query);

      ctx.send({
        success: true,
        data: contacts,
      });
    } catch (error) {
      ctx.badRequest('Failed to search contacts', { error: error.message });
    }
  },

  // Volunteer management
  async addVolunteer(ctx) {
    try {
      const { name, email, phone, interests, availability } = ctx.request.body;
      
      if (!name || !email) {
        return ctx.badRequest('Name and email are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const volunteer = await growthsphereService.addVolunteer({
        name,
        email,
        phone,
        interests,
        availability,
      });

      ctx.send({
        success: true,
        data: volunteer,
      });
    } catch (error) {
      ctx.badRequest('Failed to add volunteer', { error: error.message });
    }
  },

  // Donor management
  async addDonor(ctx) {
    try {
      const { name, email, phone, amount, frequency } = ctx.request.body;
      
      if (!name || !email) {
        return ctx.badRequest('Name and email are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const donor = await growthsphereService.addDonor({
        name,
        email,
        phone,
        amount,
        frequency,
      });

      ctx.send({
        success: true,
        data: donor,
      });
    } catch (error) {
      ctx.badRequest('Failed to add donor', { error: error.message });
    }
  },

  // Community member management
  async addCommunityMember(ctx) {
    try {
      const { name, email, phone, interests, pronouns } = ctx.request.body;
      
      if (!name || !email) {
        return ctx.badRequest('Name and email are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const member = await growthsphereService.addCommunityMember({
        name,
        email,
        phone,
        interests,
        pronouns,
      });

      ctx.send({
        success: true,
        data: member,
      });
    } catch (error) {
      ctx.badRequest('Failed to add community member', { error: error.message });
    }
  },

  // Opportunity management
  async getOpportunities(ctx) {
    try {
      const { contactId } = ctx.query;
      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const opportunities = await growthsphereService.getOpportunities(contactId);

      ctx.send({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      ctx.badRequest('Failed to get opportunities', { error: error.message });
    }
  },

  // Pipeline management
  async getPipelines(ctx) {
    try {
      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const pipelines = await growthsphereService.getPipelines();

      ctx.send({
        success: true,
        data: pipelines,
      });
    } catch (error) {
      ctx.badRequest('Failed to get pipelines', { error: error.message });
    }
  },

  async getPipelineStages(ctx) {
    try {
      const { pipelineId } = ctx.params;
      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const stages = await growthsphereService.getPipelineStages(pipelineId);

      ctx.send({
        success: true,
        data: stages,
      });
    } catch (error) {
      ctx.badRequest('Failed to get pipeline stages', { error: error.message });
    }
  },

  // Communication
  async addNote(ctx) {
    try {
      const { contactId, body } = ctx.request.body;
      
      if (!contactId || !body) {
        return ctx.badRequest('Contact ID and note body are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const note = await growthsphereService.addNote({ contactId, body });

      ctx.send({
        success: true,
        data: note,
      });
    } catch (error) {
      ctx.badRequest('Failed to add note', { error: error.message });
    }
  },

  async sendEmail(ctx) {
    try {
      const { contactId, subject, body, from } = ctx.request.body;
      
      if (!contactId || !subject || !body) {
        return ctx.badRequest('Contact ID, subject, and body are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const email = await growthsphereService.sendEmail({ contactId, subject, body, from });

      ctx.send({
        success: true,
        data: email,
      });
    } catch (error) {
      ctx.badRequest('Failed to send email', { error: error.message });
    }
  },

  async sendSMS(ctx) {
    try {
      const { contactId, message, from } = ctx.request.body;
      
      if (!contactId || !message) {
        return ctx.badRequest('Contact ID and message are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const sms = await growthsphereService.sendSMS({ contactId, message, from });

      ctx.send({
        success: true,
        data: sms,
      });
    } catch (error) {
      ctx.badRequest('Failed to send SMS', { error: error.message });
    }
  },

  // Analytics
  async getAnalytics(ctx) {
    try {
      const { startDate, endDate } = ctx.query;
      
      if (!startDate || !endDate) {
        return ctx.badRequest('Start date and end date are required');
      }

      const growthsphereService = strapi.service('api::growthsphere.growthsphere');
      const analytics = await growthsphereService.getAnalytics(startDate, endDate);

      ctx.send({
        success: true,
        data: analytics,
      });
    } catch (error) {
      ctx.badRequest('Failed to get analytics', { error: error.message });
    }
  },

  // Webhook handlers
  async handleWebhook(ctx) {
    try {
      const event = ctx.headers['x-ghl-event'];
      const signature = ctx.headers['x-ghl-signature'];
      const webhookSecret = process.env.GHL_WEBHOOK_SECRET;

      // Verify webhook signature (you'll need to implement this)
      if (signature && webhookSecret) {
        // Implement signature verification
        const isValid = await this.verifyWebhookSignature(ctx.request.body, signature, webhookSecret);
        if (!isValid) {
          return ctx.unauthorized('Invalid webhook signature');
        }
      }

      // Handle different webhook events
      switch (event) {
        case 'contact.created':
          await this.handleContactCreated(ctx.request.body);
          break;
        case 'contact.updated':
          await this.handleContactUpdated(ctx.request.body);
          break;
        case 'opportunity.created':
          await this.handleOpportunityCreated(ctx.request.body);
          break;
        case 'opportunity.won':
          await this.handleOpportunityWon(ctx.request.body);
          break;
        default:
          strapi.log.info(`Unhandled webhook event: ${event}`);
      }

      ctx.send({ success: true });
    } catch (error) {
      ctx.badRequest('Failed to handle webhook', { error: error.message });
    }
  },

  async handleContactCreated(data) {
    // Sync new contact to your local database or trigger actions
    strapi.log.info('New contact created in GrowthSphere360:', data);
  },

  async handleContactUpdated(data) {
    // Sync updated contact data
    strapi.log.info('Contact updated in GrowthSphere360:', data);
  },

  async handleOpportunityCreated(data) {
    // Handle new opportunities (donations, volunteer signups, etc.)
    strapi.log.info('New opportunity created in GrowthSphere360:', data);
  },

  async handleOpportunityWon(data) {
    // Handle won opportunities (successful donations, completed volunteer onboarding, etc.)
    strapi.log.info('Opportunity won in GrowthSphere360:', data);
  },

  async verifyWebhookSignature(body, signature, secret) {
    // TODO: Implement actual HMAC verification once GHL's signing scheme is known.
    // Until then, reject all webhook requests to avoid accepting forged payloads.
    strapi.log.warn('Webhook signature verification is not yet implemented — rejecting request');
    return false;
  },
});
