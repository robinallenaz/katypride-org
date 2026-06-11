# Katy Pride Website

> **Building community, advocating for equality, and celebrating diversity in Katy and West Houston**
> **Tech Stack**: Next.js + PostgreSQL (Neon) + GrowthSphere360 CRM + Cloudinary

---

## 5-Minute Admin Quick Start

### Step 1: Log in to the Admin Panel

```
https://katypride.org/admin
```

Sign in with your `@katypride.org` email and password.

### Step 2: What you can manage

| Section | What it controls |
|---------|-----------------|
| **Events** | Add/edit/delete upcoming community events |
| **Coffee Meetup** | Configure recurring coffee meetup schedule and locations |
| **Carousel** | Homepage rotating images |
| **Resources** | Community support links (supplements the hardcoded defaults) |
| **Site Images** | Page-specific images (About hero, etc.) |
| **Form Submissions** | View vendor, sponsor, and volunteer form submissions |

### Step 3: Emergency Help

- **Website Issues**: [Troubleshooting Guide](./TROUBLESHOOTING.md)
- **Support**: info@katypride.org

---

## Technical Architecture

### Stack overview

| Layer | Service | Notes |
|-------|---------|-------|
| **Frontend** | Next.js 16 on **Vercel** | App Router, Tailwind CSS |
| **Database** | **Neon** PostgreSQL | Events, site images, form submissions, rate limits |
| **Images** | **Cloudinary** | Uploaded via admin panel; auto-optimized |
| **CRM** | **GrowthSphere360** | GoHighLevel white-label; volunteer/donor/vendor contacts |
| **Donations** | **Givebutter** | Embedded campaign widget on `/donate` |
| **Calendar** | **Google Calendar** | Embedded iframe on `/calendar` |

There is no external CMS (Strapi was planned but is not in active use). All content management happens through the built-in `/admin` panel.

### Data storage

- **Events** — PostgreSQL (`events` table). Managed via `/admin/events`.
- **Site Images** — PostgreSQL (`site_images` table). Managed via `/admin/site-images`.
- **Carousel Images** — PostgreSQL-backed via Cloudinary upload. Managed via `/admin/carousel`.
- **Form Submissions** — PostgreSQL (`form_submissions` table). Viewed via `/admin/submissions`.
- **Coffee Meetup Config** — PostgreSQL (`app_config` table). Managed via `/admin/coffee-meetup`.
- **Resources** — Hardcoded defaults in `src/app/resources/page.tsx` supplemented by `data/resources.json`. Managed via `/admin/resources`.

In local development without `DATABASE_URL`, all data falls back to JSON files in the `data/` directory.

### Frontend structure

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom purple brand theme
- **Icons**: Lucide React
- **Deployment**: Vercel (automatic deploys from `main` branch)

---

## Admin Guide by Page

### Home Page

**Carousel images**: `/admin/carousel`
- Upload images via Cloudinary
- Images are stored in PostgreSQL and served at build/runtime

**Site images** (hero photos, etc.): `/admin/site-images`

### Events Page (`/events`)

**Manage at**: `/admin/events`

Each event has:
- Title, start/end date & time, location
- Category (general, coffee, social, fundraising, advocacy, education, health, youth, pride, volunteer, cultural, community)
- Optional image (Cloudinary URL), external URL + CTA label
- Summary text
- Recurring flag and parent relationship

Events show only today and future dates. They are sorted chronologically.

**Coffee Meetup**: The recurring coffee meetup is configured separately at `/admin/coffee-meetup`. It automatically calculates the 2nd Friday of each month and supports odd/even month location rotation, manual date overrides, and skip months.

### Calendar Page (`/calendar`)

Managed directly in **Google Calendar** — changes appear instantly via the embedded iframe.

To grant someone edit access:
1. Open Google Calendar → "Katy Pride" calendar settings
2. Share with specific people → add their email
3. Set permission: **Make changes to events**

### Resources Page (`/resources`)

Default resources are hardcoded in `src/app/resources/page.tsx`. Additional resources can be added via `/admin/resources` and stored in `data/resources.json` — these appear before the defaults and duplicates (by URL) are suppressed.

### Donate Page (`/donate`)

Donations are handled by an embedded **Givebutter** campaign widget (widget ID `LylovA`). No server-side code is involved — the widget runs entirely client-side.

### Volunteer Page (`/volunteer`) and Donor Page (`/donate`)

CRM contact forms send submissions to **GrowthSphere360** via `/api/crm` and also record them in the `form_submissions` PostgreSQL table. Submissions are viewable at `/admin/submissions`.

### Vendor Signup (`/vendor-signup`)

The vendor application form submits to `/api/crm` with `vendor` tags and records in `form_submissions`. Viewable at `/admin/submissions`.

### Celebration / 5K Page (`/celebration`)

Static content page. Update copy directly in `src/app/celebration/page.tsx`.

---

## CRM Integration (GrowthSphere360)

### Overview

All form submissions (volunteer, donor, vendor, community member) are sent to **GrowthSphere360** (GoHighLevel white-label) and stored locally in PostgreSQL.

### Data flow

```
Form → Next.js /api/crm → GrowthSphere360 API
                        → PostgreSQL form_submissions table
```

### Contact types

| Type | CRM Tags | Key custom fields |
|------|----------|-------------------|
| Volunteer | `volunteer` + interests | availability, interests, pronouns |
| Donor | `donor` | donation_frequency, last_donation_amount, pronouns |
| Vendor | `vendor`, `vendor-{type}` | company_name, vendor_type, vendor_fee, products_services |
| Community Member | `community-member` + interests | interests, pronouns |

### Environment variables

```env
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
GHL_VENDOR_PIPELINE_ID=your_vendor_pipeline_id_here
CRM_ADMIN_SECRET=your_admin_secret_here
DATABASE_URL=your_neon_postgres_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD_HASH=bcrypt_hash_of_admin_password
```

Add to Vercel environment variables for production; to `.env.local` for local development.

---

## Security & Performance

- **Rate limiting**: PostgreSQL-backed, 5 requests/minute per IP on form endpoints
- **Bot protection**: Honeypot `_gotcha` field on all forms
- **Input validation**: All form fields validated server-side
- **Admin auth**: `@katypride.org` email + bcrypt password hash; JWT stored in session
- **Image safety**: Cloudinary URLs validated before storage
- **Health check**: `/api/admin/verify` for admin session validation

---

## Local Development

```bash
npm ci
npm run dev
# http://localhost:3000
```

Without `DATABASE_URL`, data falls back to JSON files in `data/`. This is fine for local development but form submissions and admin edits won't persist between server restarts.

To use the local admin panel, set `ADMIN_PASSWORD_HASH` in `.env.local` (generate with `npx bcryptjs`).
