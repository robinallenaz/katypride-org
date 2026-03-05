# Katy Pride Website

A modern, scalable website for **Katy Pride**, an LGBTQ+ community organization serving Katy and West Houston.

## 🚀 Quick Start for Admins

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

All form submissions automatically sync to GrowthSphere360 CRM:

| Form | CRM Tags |
|------|----------|
| Volunteer | `volunteer` + selected interests |
| Donor | `donor` |
| Vendor | `vendor`, `vendor-{type}`, `chase-the-rainbow-5k-2026` |

**View submissions**:
1. Log in to GrowthSphere360
2. Go to **Contacts**
3. Filter by tags (`vendor`, `volunteer`, `donor`)

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