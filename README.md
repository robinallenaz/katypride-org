# Katy Pride Website

A modern, scalable website for **Katy Pride**, an LGBTQ+ community organization serving Katy and West Houston.

## � Security & Performance Features

### Security Enhancements
- **Rate Limiting**: 5 submissions per minute per IP with automatic cleanup
- **Input Validation**: Comprehensive validation for all form submissions
- **Bot Protection**: Honeypot fields and enhanced IP detection
- **Safe URL Handling**: Validated image URLs to prevent XSS
- **Authentication**: Secure admin dashboard with bearer token auth

### Performance Optimizations
- **CRM Caching**: 5-minute in-memory cache for dashboard data
- **Optimized Pagination**: Reduced API calls for better performance
- **Image Safety**: Validated and safely constructed image URLs
- **Efficient State Management**: Reduced unnecessary re-renders

### Monitoring & Reliability
- **Health Checks**: `/health` endpoint for service monitoring
- **Error Handling**: Comprehensive error logging and user feedback
- **Graceful Degradation**: Fallbacks for API failures

## �🚀 Quick Start for Admins

**Access Strapi Admin Panel**: `https://katypride-7x4qno1sj-robinallenazs-projects.vercel.app/admin`

**What you can manage**:
- Events, Resources, Forms, Page Content
- Form links for volunteer/donor/vendor signup  
- Carousel images and calendar settings

---

## 📋 Admin Guide by Website Page

### 🏠 Home Page
**Content managed via**: Strapi Admin → Content Manager → **Carousel Image**

**How to manage**:
1. Go to **Content Manager** → **Carousel Image**
2. Click **+ Create new entry**
3. Add title, upload image, set alt text
4. Toggle **Active** to show/hide on homepage
5. Click **Save** then **Publish**

### 📅 Events Page (`/events`)
**Content managed via**: Strapi Admin → Content Manager → **Event**

**How to add an event**:
1. Click **+ Create new entry**
2. Fill in required fields:
   - **Title**: Event name
   - **Start/End**: Date and time
   - **Location**: Venue address
   - **Image**: Upload event image
   - **Summary**: Event details (rich text)
   - **External URL**: Registration/ticket link (optional)
   - **External CTA Label**: Button text (e.g., "Register Now")
   - **Published**: Toggle to show/hide
3. Click **Save** then **Publish**

**Important**: Events automatically appear in date order. Past events are hidden.

### 🗓️ Calendar Page (`/calendar`)
**Content managed via**: Google Calendar (not Strapi)

**How to manage**:
1. Access Google Calendar with admin permissions
2. Add/edit events directly in Google Calendar
3. Changes appear instantly on website

**To give someone admin access**:
1. Go to Google Calendar → **Katy Pride** calendar settings
2. **Share with specific people** → Add email
3. Set permission: **Make changes to events**

### 🎉 Celebration Page (`/celebration`)
**Content managed via**: Strapi Admin → Content Manager

**Page Content**:
1. Go to **Content Manager** → **Page Content**
2. Find entry with `page: "celebration"`
3. Edit **Heading** and **Intro** content
4. Click **Save** then **Publish**

**Form Links** (Chase the Rainbow 5K signup forms):
1. Go to **Content Manager** → **Form Link**
2. Click **+ Create new entry**
3. Fill in:
   - **Title**: Form name (e.g., "Volunteer Signup")
   - **URL**: Form link
   - **Page**: Select "celebration"
   - **Active**: Toggle to show/hide
   - **Order Rank**: Number for ordering (1 = first)
4. Click **Save** then **Publish**

### 📚 Resources Page (`/resources`)
**Content managed via**: Strapi Admin → Content Manager → **Resource Link**

**How to add a resource**:
1. Click **+ Create new entry**
2. Fill in:
   - **Name**: Organization name
   - **URL**: Website link
   - **Category**: health | advocacy | ally | regional | national
   - **Active**: Toggle to show/hide
   - **Description**: Brief description (optional)
3. Click **Save** then **Publish**

**Note**: Resources appear in category order. Default resources are built-in but can be overridden.

### 🏢 About Page (`/about`)
**Content managed via**: Strapi Admin → Content Manager → **Page Content**

**How to edit**:
1. Find entry with `page: "about"`
2. Edit **Heading** and **Intro** content
3. Click **Save** then **Publish**

### 📢 Advocacy Page (`/advocacy`)
**Content managed via**: Strapi Admin → Content Manager → **Page Content**

**How to edit**:
1. Find entry with `page: "advocacy"`
2. Edit **Heading** and **Intro** content
3. Click **Save** then **Publish**

### 🤝 Volunteer & Donation Forms
**Content managed via**: Strapi Admin → Content Manager → **Form Link**

**Volunteer Page (`/volunteer`)**:
1. Create Form Link entries with `page: "volunteer"`
2. Links appear as signup buttons on the page

**Donation Page (`/donate`)**:
1. Create Form Link entries with `page: "donor"`
2. Links appear as donation options

### 🏪 Vendor Signup (`/vendor-signup`)
**Content managed via**: Strapi Admin → Content Manager → **Form Link**

**How to manage vendor forms**:
1. Create Form Link entries with `page: "vendor"`
2. Links appear as vendor application options
3. Submissions go to GrowthSphere360 CRM with `vendor` tags

---

## 🔄 CRM Integration (GrowthSphere360)

### Overview
The Katy Pride website integrates with **GrowthSphere360** (GoHighLevel white-label) CRM to automatically capture and organize all form submissions. This integration provides centralized contact management for volunteers, donors, vendors, and community members.

### Architecture
```
Frontend Forms → Next.js API Route → GrowthSphere360 API → CRM Dashboard
```

### API Endpoint: `/api/crm`
**Location**: `src/app/api/crm/route.ts`

**Methods**:
- `POST` - Submit new contact data from forms
- `GET` - Retrieve CRM statistics (admin only)

### Security Features
- **Rate Limiting**: 5 submissions per minute per IP
- **Honeypot Field**: Hidden `_gotcha` field to block bots
- **Input Validation**: Strict validation of all form fields
- **Tag Sanitization**: Only allows predefined interest tags
- **Admin Authentication**: Bearer token required for dashboard access

### Contact Types & Data Flow

#### 1. Volunteer Submissions
**Form Component**: `CRMContactForm` with `type="volunteer"`
**CRM Tags**: `volunteer` + selected interests
**Custom Fields**:
- `availability` - Text description of availability
- `interests` - Comma-separated interest list
- `pronouns` - Optional pronoun field

**Allowed Interests**:
- Event Planning, Community Outreach, Youth Programs
- Fundraising, Social Media, Administrative Support
- Mentorship, Healthcare Support

#### 2. Donor Submissions
**Form Component**: `CRMContactForm` with `type="donor"`
**CRM Tags**: `donor`
**Custom Fields**:
- `donation_frequency` - "one-time" or "monthly"
- `last_donation_amount` - Numeric donation amount
- `pronouns` - Optional pronoun field

#### 3. Vendor Applications
**Form Component**: Custom vendor form (planned)
**CRM Tags**: `vendor`, `vendor-{type}`, `chase-the-rainbow-5k-2026`
**Custom Fields**:
- `company_name` - Business name
- `website` - Business website
- `social_media` - Social media links
- `vendor_type` - Type of vendor
- `vendor_fee` - Fee tier selected
- `products_services` - Description of offerings
- `address` - Full business address

**Allowed Vendor Types**:
- `nonprofit` - Non-profit organizations
- `forprofit` - For-profit businesses
- `food` - Food vendors
- `political` - Political organizations
- `government` - Government entities

#### 4. Community Member Submissions
**Form Component**: `CRMContactForm` with `type="community-member"`
**CRM Tags**: `community-member` + selected interests
**Custom Fields**:
- `interests` - Comma-separated interest list
- `pronouns` - Optional pronoun field

**Allowed Interests**:
- LGBTQ+ Advocacy, Youth Support, Parent Resources
- Ally Programs, Education, Health & Wellness
- Legal Support, Faith Communities

### Environment Variables Required
```env
# GrowthSphere360 CRM Integration
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
CRM_ADMIN_SECRET=your_admin_secret_here
```

**Setup Instructions**:
1. Get API credentials from GrowthSphere360 admin panel
2. Add to Vercel environment variables (production)
3. Add to `.env.local` for local development
4. `CRM_ADMIN_SECRET` can be any random string for dashboard auth

### API Request Flow

#### POST /api/crm (Form Submission)
```json
{
  "type": "volunteer|donor|vendor|community-member",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "_gotcha": "", // Hidden field - bots fill this
  // Type-specific fields...
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you! Your information has been submitted successfully.",
  "data": { "contactId": "contact_123" }
}
```

#### GET /api/crm (Dashboard Data)
**Headers**: `Authorization: Bearer {CRM_ADMIN_SECRET}`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalContacts": 150,
    "totalVolunteers": 45,
    "totalDonors": 28,
    "totalVendors": 12,
    "totalCommunityMembers": 65,
    "recentContacts": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "tags": ["volunteer", "Event Planning"],
        "dateAdded": "2024-01-15T10:30:00Z",
        "company": "Doe Enterprises"
      }
    ]
  }
}
```

### CRM Dashboard
**Location**: `/crm` (requires admin secret)
**Component**: `CRMDashboard.tsx`

**Features**:
- Real-time contact statistics
- Recent submissions table
- Quick links to forms and GrowthSphere360
- Automatic data refresh

**Access Control**:
- Requires `CRM_ADMIN_SECRET` bearer token
- Token stored in sessionStorage for session persistence
- Unauthorized users see 401 error

### GrowthSphere360 Integration Details

#### API Configuration
- **Base URL**: `https://rest.gohighlevel.com/v1`
- **Authentication**: Bearer token (API Key)
- **Version**: `2021-04-15`
- **Location ID**: Required for all requests

#### Contact Creation
```javascript
const contactPayload = {
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  tags: ["volunteer", "Event Planning"],
  customFields: {
    availability: "Weekends",
    interests: "Event Planning, Community Outreach"
  },
  locationId: "your_location_id"
};
```

#### Data Synchronization
- **Real-time**: Form submissions create contacts immediately
- **Bidirectional**: Changes in GrowthSphere360 reflect in dashboard
- **Deduplication**: Email addresses prevent duplicate contacts
- **Tag-based**: All organization happens via CRM tags

### Monitoring & Troubleshooting

#### Common Issues
1. **Missing Environment Variables**: Check GHL_API_KEY and GHL_LOCATION_ID
2. **Rate Limiting**: 5 submissions/minute per IP - wait and retry
3. **Invalid Tags**: Only predefined interests allowed - check form validation
4. **Auth Failures**: Verify CRM_ADMIN_SECRET matches dashboard token

#### Logging
- All API errors logged to console
- GrowthSphere360 API errors include response details
- Form submissions logged with contact IDs

#### Testing
- Use browser dev tools to inspect form submissions
- Check Network tab for `/api/crm` requests
- Verify GrowthSphere360 contact creation
- Test dashboard with valid admin secret

### Future Enhancements
- **Webhooks**: Real-time updates from GrowthSphere360
- **Custom Workflows**: Automated email sequences
- **Advanced Reporting**: Export contact data
- **Form Analytics**: Submission conversion tracking

---

## 🛠️ Technical Setup

### Architecture
| Layer | Service | Cost |
|-------|---------|------|
| **Frontend** | Next.js on **Vercel** | Free |
| **CMS** | Strapi v5 on **Render** | Free |
| **Database** | **Neon** PostgreSQL | Free (512MB) |
| **CRM** | **GrowthSphere360** | Existing plan |

### Local Development

**Frontend**:
```bash
npm ci
npm run dev
# http://localhost:3000