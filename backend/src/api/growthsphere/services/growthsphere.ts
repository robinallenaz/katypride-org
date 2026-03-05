import { factories } from '@strapi/strapi';

interface GHLContact {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
}

interface GHLOpportunity {
  name: string;
  pipelineId: string;
  stageId: string;
  contactId: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost';
  expectedCloseDate?: string;
}

interface GHLNote {
  contactId: string;
  body: string;
}

interface GHLEmail {
  contactId: string;
  subject: string;
  body: string;
  from?: string;
}

interface GHLSMS {
  contactId: string;
  message: string;
  from?: string;
}

class GrowthSphereService {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.locationId = process.env.GHL_LOCATION_ID || '';
    this.baseUrl = 'https://rest.gohighlevel.com/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`GHL API Error: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GrowthSphere360 API Error:', error);
      throw error;
    }
  }

  // Contact Management
  async createContact(contact: GHLContact) {
    return this.makeRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        locationId: this.locationId,
      }),
    });
  }

  async getContact(contactId: string) {
    return this.makeRequest(`/contacts/${contactId}`);
  }

  async updateContact(contactId: string, updates: Partial<GHLContact>) {
    return this.makeRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async searchContacts(query: string) {
    return this.makeRequest(`/contacts/search?query=${encodeURIComponent(query)}`);
  }

  // Opportunity Management
  async createOpportunity(opportunity: GHLOpportunity) {
    return this.makeRequest('/opportunities/', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
  }

  async getOpportunities(contactId?: string) {
    const query = contactId ? `?contactId=${contactId}` : '';
    return this.makeRequest(`/opportunities/${query}`);
  }

  async updateOpportunity(opportunityId: string, updates: Partial<GHLOpportunity>) {
    return this.makeRequest(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Communication
  async addNote(note: GHLNote) {
    return this.makeRequest('/contacts/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async sendEmail(email: GHLEmail) {
    return this.makeRequest('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...email,
        type: 'EMAIL',
        locationId: this.locationId,
      }),
    });
  }

  async sendSMS(sms: GHLSMS) {
    return this.makeRequest('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...sms,
        type: 'SMS',
        locationId: this.locationId,
      }),
    });
  }

  // Pipeline Management
  async getPipelines() {
    return this.makeRequest('/pipelines/');
  }

  async getPipelineStages(pipelineId: string) {
    return this.makeRequest(`/pipelines/${pipelineId}/stages`);
  }

  // Custom Fields
  async getCustomFields() {
    return this.makeRequest('/custom-fields/');
  }

  // Tags
  async getTags() {
    return this.makeRequest('/tags/');
  }

  async createTag(name: string) {
    return this.makeRequest('/tags/', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Webhook Management
  async createWebhook(targetUrl: string, events: string[]) {
    return this.makeRequest('/webhooks/', {
      method: 'POST',
      body: JSON.stringify({
        targetUrl,
        events,
        locationId: this.locationId,
      }),
    });
  }

  // Analytics
  async getAnalytics(startDate: string, endDate: string) {
    return this.makeRequest(`/analytics?startDate=${startDate}&endDate=${endDate}`);
  }

  // Utility methods for Katy Pride specific use cases
  async addVolunteer(volunteerData: {
    name: string;
    email: string;
    phone?: string;
    interests?: string[];
    availability?: string;
  }) {
    const contact: any = await this.createContact({
      name: volunteerData.name,
      email: volunteerData.email,
      phone: volunteerData.phone,
      tags: ['volunteer', ...(volunteerData.interests || [])],
      customFields: {
        availability: volunteerData.availability,
        volunteer_interests: volunteerData.interests,
      },
    });

    // Add volunteer opportunity
    await this.createOpportunity({
      name: `Volunteer: ${volunteerData.name}`,
      pipelineId: 'volunteer-pipeline-id', // You'll need to get this from GHL
      stageId: 'new-volunteer-stage-id', // You'll need to get this from GHL
      contactId: contact.contact.id,
    });

    return contact;
  }

  async addDonor(donorData: {
    name: string;
    email: string;
    phone?: string;
    amount?: number;
    frequency?: 'one-time' | 'monthly';
  }) {
    const contact: any = await this.createContact({
      name: donorData.name,
      email: donorData.email,
      phone: donorData.phone,
      tags: ['donor'],
      customFields: {
        donation_frequency: donorData.frequency,
        last_donation_amount: donorData.amount,
      },
    });

    if (donorData.amount) {
      await this.createOpportunity({
        name: `Donation: ${donorData.name}`,
        pipelineId: 'donation-pipeline-id', // You'll need to get this from GHL
        stageId: 'new-donation-stage-id', // You'll need to get this from GHL
        contactId: contact.contact.id,
        monetaryValue: donorData.amount,
      });
    }

    return contact;
  }

  async addCommunityMember(memberData: {
    name: string;
    email: string;
    phone?: string;
    interests?: string[];
    pronouns?: string;
  }) {
    return this.createContact({
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone,
      tags: ['community-member', ...(memberData.interests || [])],
      customFields: {
        pronouns: memberData.pronouns,
        interests: memberData.interests,
      },
    });
  }
}

export default {
  create: () => new GrowthSphereService(),
};
