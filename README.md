# Katy Pride Website

This repository contains the website for **Katy Pride**, an LGBTQ+ community organization serving Katy and West Houston.
## What’s in this site

Current pages include:

- **Home**
- **About** (Mission, Vision, Pronouns Matter)
- **Events**
- **Calendar**
- **Advocacy** (Helpful links + Title IX and KISD Gender Policy support sections)
-  **Celebration**
- **Resources** (categorized local & national resources with jump navigation)

- **Donate**
- **Newsletter**
- **Volunteer**

Images are served from **Cloudinary**.

## Admin: managing events

Events are managed in **Sanity Studio**, embedded in this Next.js app.

- **Studio URL (production/Vercel)**
  - `https://<your-domain>/studio`
  - Examples:
    - `https://katypride.org/studio`
    - `https://<your-vercel-domain>/studio`

### Add/edit regular events

1. Open the Studio (`/studio`)
2. Go to **Events**
3. Create or edit an Event
4. Fill in any of the following:
   - **Title**
   - **Start / End** date & time
   - **Location**
   - **Image**
   - **Summary** (rich text)
   - **External URL** (optional)
   - **External Link Button Text** (optional)
     - Examples: `Buy tickets`, `RSVP`, `Register`, `Donate`
5. Publish

The public Events page (`/events`) automatically displays upcoming published events.

### Recurring “Espresso Yourself” coffee meetups

The site automatically generates upcoming coffee meetups (2nd Friday). Admins can customize individual instances without losing the recurring behavior.

#### Customize or cancel a specific coffee meetup

1. Open the Studio (`/studio`)
2. Go to **Coffee Meetup Overrides**
3. Create a new override document
4. Set **Meetup Date** to the specific meetup date you want to customize (YYYY-MM-DD)
5. Optionally set any overrides (title, time, location/address, image, summary, external link)
6. To remove an instance from the public feed, set **Cancelled** = true

When an override exists for a date, the Events page will use the override values for that specific meetup.

### Important: GitHub Pages vs Vercel

- GitHub Pages deployments are **static previews** and are not intended for admin management.
- Admins should use the **Vercel/production** site to access the Studio at `/studio`.

## Admin: managing the Google Calendar

The `/calendar` page embeds a **Google Calendar**. Events added to this calendar appear automatically in the embedded view.

### Give admins edit access to the calendar

1. Open [Google Calendar](https://calendar.google.com) as the calendar owner
2. Find the **Katy Pride** calendar in the left sidebar
3. Click the **⋮** (three dots) → **Settings and sharing**
4. Scroll to **Share with specific people or groups**
5. Click **+ Add people and groups**
6. Enter each admin's email address
7. Set permission to **Make changes to events** (or **Make changes and manage sharing** for full control)
8. Click **Send**

### Add events to the calendar

Once an admin has edit access:

1. Go to [Google Calendar](https://calendar.google.com)
2. Make sure you're viewing the **Katy Pride** calendar
3. Click on a date/time → **Create event**
4. Fill in details and save

The event will appear in the embedded calendar on `/calendar` automatically.

### Note: Events page vs Calendar page

| Where admins add events | Where it shows up |
|-------------------------|-------------------|
| **Google Calendar** | Embedded calendar on `/calendar` |
| **Sanity Studio** | Events feed on `/events` |

If you want an event in **both places**, add it in both Google Calendar and Sanity Studio.

## Running locally

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

This project is configured for static export (for GitHub Pages previews):

```bash
npm run build
```

## Preview deployments (GitHub Pages)

This repo includes a GitHub Actions workflow that builds the static site and deploys it to GitHub Pages.


In GitHub:

1. Repo **Settings**
2. **Pages**
3. **Build and deployment**
4. **Source**: `GitHub Actions`

The preview URL will be:

```text
https://<github-username>.github.io/<repo-name>/
```

## Tech stack (current)

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Cloudinary** (hosted images)
- **Sanity** (headless CMS for events, embedded Studio at `/studio`)
- **GitHub Actions** (GitHub Pages deployment)

## Tech stack (planned / rough outline)

- **Forms**: Google Forms (newsletter signup + volunteer intake)
- **Email / newsletter**: Mailchimp
- **Analytics**: privacy-friendly analytics (provider TBD, maybe Umami self-hosted on Vercel or Vercel Analytics)
- **Accessibility & QA**: automated checks (linting, link checking, a11y audits)
- **Hosting / deployment**: Vercel (production) + GitHub Pages (preview)

