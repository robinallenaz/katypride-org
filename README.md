# Katy Pride Website

This repository contains the website for **Katy Pride**, an LGBTQ+ community organization serving Katy and West Houston.

## Architecture

| Layer | Service | Cost |
|-------|---------|------|
| **Frontend** | Next.js on **Vercel** | Free |
| **CMS** | Strapi v5 on **Render** (free tier) | Free |
| **Database** | **Neon** PostgreSQL | Free (512MB) |
| **CRM** | **GrowthSphere360** (GoHighLevel) | Existing plan |
| **Images** | Cloudinary | Free tier |

## Pages

- **Home** — Carousel, featured events
- **About** — Mission, Vision, Pronouns Matter
- **Events** — Upcoming events from Strapi
- **Calendar** — Embedded Google Calendar
- **Advocacy** — Title IX, KISD policy support
- **Celebration** — Chase the Rainbow 5K info
- **Resources** — Categorized local & national LGBTQ+ resources
- **Donate** — Donation form → GrowthSphere360 CRM
- **Volunteer** — Volunteer signup → GrowthSphere360 CRM
- **Vendor Signup** (`/vendor-signup`) — Chase the Rainbow 5K vendor application → CRM
- **Newsletter** — Newsletter signup
- **News** — Blog posts with HTML support (mailto links, etc.)

## Admin: Managing Content (Strapi)

Admins manage site content through the **Strapi admin panel**.

### Access the Admin Panel

- **Production**: `https://<your-render-app>.onrender.com/admin`
- **Local**: `http://localhost:1337/admin`

### What Admins Can Manage

| Content Type | Description |
|-------------|-------------|
| **Events** | Title, date, location, image, summary, external links, category (general/coffee) |
| **Resource Links** | Name, URL, category (health/advocacy/ally/regional/national), description |
| **Carousel Images** | Title, image, alt text, active status |
| **Calendar Settings** | Google Calendar ID, timezone, title, description |

### Add/Edit an Event

1. Log in to the Strapi admin panel
2. Click **Content Manager** → **Event**
3. Click **+ Create new entry**
4. Fill in: Title, Start/End date, Location, Image, Summary, External URL
5. Set **Event Category**: `general` or `coffee`
6. Click **Save** then **Publish**

### Add/Edit a Resource

1. Click **Content Manager** → **Resource Link**
2. Click **+ Create new entry**
3. Fill in: Name, URL, Category, Description
4. Click **Save** then **Publish**

## Admin: Google Calendar

The `/calendar` page embeds a **Google Calendar**.

### Give admins edit access

1. Open [Google Calendar](https://calendar.google.com) as the calendar owner
2. Find the **Katy Pride** calendar → **⋮** → **Settings and sharing**
3. Scroll to **Share with specific people or groups**
4. Add admin emails with **Make changes to events** permission

### Events page vs Calendar page

| Where admins add events | Where it shows up |
|-------------------------|-------------------|
| **Google Calendar** | Embedded calendar on `/calendar` |
| **Strapi** | Events feed on `/events` |

## CRM Integration (GrowthSphere360)

Forms on the website submit directly to GrowthSphere360 via the `/api/crm` API route.

### Forms → CRM

| Form | URL | CRM Tags |
|------|-----|----------|
| Volunteer signup | `/volunteer` | `volunteer` + selected interests |
| Donor form | `/donate` | `donor` |
| Vendor application | `/vendor-signup` | `vendor`, `vendor-{type}`, `chase-the-rainbow-5k-2026` |

### Vendor Data in CRM

Vendor submissions include: company name, address, contact info, vendor type, fee, products/services, social media, and website. All stored as custom fields and tags.

### View CRM Data

1. Log in to GrowthSphere360
2. Click **Contacts** to see all submissions
3. Filter by tags (e.g., `vendor`, `volunteer`, `donor`)

## Running Locally

### Frontend (Next.js)

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`

### Backend (Strapi)

```bash
cd backend
npm ci
npm run develop
```

Open `http://localhost:1337/admin`

## Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
GHL_API_KEY=your_gohighlevel_api_key
GHL_LOCATION_ID=your_ghl_location_id
CRM_ADMIN_SECRET=your_crm_dashboard_admin_token
```

### Backend (`backend/.env`)

```env
# Server
HOST=0.0.0.0
PORT=1337

# Secrets (auto-generated, keep these)
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
ENCRYPTION_KEY=...
JWT_SECRET=...

# Database - Neon PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Import the `katypride-org` repo
4. Add environment variables (see above)
5. Deploy — Vercel auto-detects Next.js

### CMS → Render

1. Create a [Neon](https://neon.tech) account and free PostgreSQL database
2. Copy the connection string
3. Go to [render.com](https://render.com), sign in with GitHub
4. Create a **New Web Service** from the `katypride-org` repo
5. Set **Root Directory**: `backend`
6. Set **Build Command**: `npm ci && npm run build`
7. Set **Start Command**: `npm run start`
8. Add environment variables (see Backend section above, use your Neon connection string for `DATABASE_URL`)
9. Deploy

### After Deployment

1. Visit your Render URL + `/admin` to create your admin account
2. Re-create content types through the admin panel if needed
3. Add content (events, resources, carousel images)
4. Set API permissions: **Settings → Roles → Public → check "find" for each content type**

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Strapi v5** (headless CMS)
- **Neon PostgreSQL** (database)
- **GrowthSphere360 / GoHighLevel** (CRM)
- **Cloudinary** (hosted images)
- **Vercel** (frontend hosting)
- **Render** (CMS hosting)
