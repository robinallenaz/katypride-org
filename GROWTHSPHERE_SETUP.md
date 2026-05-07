# GrowthSphere360 Integration Setup Guide

This guide will help you set up and configure the GrowthSphere360 (GoHighLevel) CRM integration for the Katy Pride website.

## 🚀 Quick Start

### 1. Environment Configuration

Your `.env` file should already contain the GrowthSphere360 credentials:

```env
# GrowthSphere360 / GoHighLevel CRM
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
GHL_VENDOR_PIPELINE_ID=your_vendor_pipeline_id_here
GHL_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Start the Strapi Backend

```bash
cd backend
npm run develop
```

### 3. Start the Frontend

```bash
npm run dev
```

## 📋 Features Overview

### ✅ What's Included

1. **Contact Management**
   - Create contacts in GrowthSphere360
   - Search and retrieve contacts
   - Tag-based organization

2. **Volunteer Management**
   - Volunteer signup forms
   - Interest tracking
   - Availability management
   - Opportunity pipeline

3. **Donor Management**
   - Donation forms
   - Recurring donation tracking
   - Donor pipeline management

4. **Community Member Management**
   - Community signup forms
   - Interest tracking
   - Pronoun support

5. **CRM Dashboard**
   - Real-time statistics
   - Pipeline overview
   - Recent activity tracking

6. **CSV Import**
   - Bulk contact import
   - Field mapping
   - Error handling

## 🛠️ API Endpoints

### Contact Management
- `POST /api/growthsphere/contacts` - Create new contact
- `GET /api/growthsphere/contacts/:contactId` - Get contact details
- `GET /api/growthsphere/contacts/search` - Search contacts

### Volunteer Management
- `POST /api/growthsphere/volunteers` - Add volunteer

### Donor Management
- `POST /api/growthsphere/donors` - Add donor

### Community Management
- `POST /api/growthsphere/community-members` - Add community member

### Pipeline Management
- `GET /api/growthsphere/opportunities` - Get opportunities
- `GET /api/growthsphere/pipelines` - Get pipelines
- `GET /api/growthsphere/pipelines/:pipelineId/stages` - Get pipeline stages

### Communication
- `POST /api/growthsphere/notes` - Add note to contact
- `POST /api/growthsphere/emails` - Send email
- `POST /api/growthsphere/sms` - Send SMS

### Analytics
- `GET /api/growthsphere/analytics` - Get analytics data

### Webhooks
- `POST /api/growthsphere/webhook` - Handle webhook events

## 📄 CSV Import Guide

### 1. Create Your CSV File

Create a CSV file with the following headers (optional fields can be omitted):

```csv
name,email,phone,city,state,zipCode,tags,pronouns,memberType,interests,availability
"John Doe","john@example.com","555-0123","Katy","TX","77494","volunteer,ally","he/him","volunteer","Event Planning,Youth Programs","Weekends"
```

### 2. Run the Import Script

```bash
cd backend/scripts
node import-contacts.js path/to/your/contacts.csv
```

### 3. Create Sample CSV

To generate a sample CSV file:

```bash
node import-contacts.js --create-sample
```

## 🎯 Frontend Integration

### Contact Forms

The `CRMContactForm` component handles different types of contacts:

```tsx
<CRMContactForm 
  type="volunteer" // or "donor" or "community-member"
  onSuccess={(data) => console.log('Success:', data)}
  onError={(error) => console.log('Error:', error)}
/>
```

### CRM Dashboard

Access the CRM dashboard at `/crm` to view:
- Contact statistics
- Pipeline overview
- Recent activity
- Quick actions

## 🔧 Configuration

### Pipeline Setup

You'll need to configure your GrowthSphere360 pipelines:

1. **Volunteer Pipeline**
   - Create a pipeline for volunteer onboarding
   - Set up stages: New → Interview → Training → Active

2. **Donor Pipeline**
   - Create a pipeline for donation management
   - Set up stages: New → First Donation → Recurring → Major Donor

### Custom Fields

Configure custom fields in GrowthSphere360:
- `pronouns` - Text field
- `availability` - Text field
- `interests` - Multi-select field
- `member_type` - Dropdown field

### Webhook Configuration

Set up webhooks in GrowthSphere360 to receive real-time updates:

1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/growthsphere/webhook`
3. Select events:
   - Contact created
   - Contact updated
   - Opportunity created
   - Opportunity won

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Contact Growth**
   - Total contacts over time
   - New signups by type (volunteer, donor, community)

2. **Engagement Metrics**
   - Form submission rates
   - Pipeline conversion rates
   - Donation amounts and frequency

3. **Community Impact**
   - Volunteer hours
   - Events attended
   - Resources accessed

### Dashboard Usage

Visit `/crm` to:
- Monitor real-time statistics
- Track pipeline progress
- View recent activity
- Export reports

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify GHL_API_KEY in .env file
   - Check API key permissions
   - Ensure location ID is correct

2. **Form Submission Errors**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check CORS settings

3. **CSV Import Issues**
   - Ensure CSV format is correct
   - Check for special characters
   - Verify required fields (name, email)

4. **Dashboard Not Loading**
   - Verify Strapi backend is running
   - Check API connectivity
   - Verify authentication

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=ghl:*
```

## 🔒 Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Webhook Security**
   - Use webhook secrets
   - Verify webhook signatures
   - Limit webhook IP access

3. **Data Privacy**
   - Follow GDPR/CCPA guidelines
   - Implement data retention policies
   - Secure personal information

## 📞 Support

### GrowthSphere360 Resources
- [GoHighLevel API Documentation](https://developer.gohighlevel.com/)
- [GrowthSphere360 Support Portal](https://support.your-growthsphere.com/)

### Katy Pride Support
- Technical issues: Contact your development team
- CRM questions: Contact GrowthSphere360 support
- Training requests: Schedule a demo session

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**
   - Review new contacts
   - Update pipeline stages
   - Check webhook delivery

2. **Monthly**
   - Export contact reports
   - Review analytics
   - Update custom fields

3. **Quarterly**
   - Audit data quality
   - Review security settings
   - Update documentation

---

## 🎉 Next Steps

1. **Test the Integration**
   - Submit test forms
   - Verify CRM data
   - Check dashboard stats

2. **Import Existing Contacts**
   - Prepare CSV file
   - Run import script
   - Verify data quality

3. **Train Your Team**
   - Review dashboard usage
   - Practice form submissions
   - Understand pipeline management

4. **Go Live**
   - Monitor performance
   - Collect feedback
   - Iterate and improve

Your GrowthSphere360 integration is now ready to help you manage contacts, volunteers, donors, and community members more effectively! 🌈
