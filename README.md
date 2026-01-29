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
- **GitHub Actions** (GitHub Pages deployment)

## Tech stack (planned / rough outline)

- **Content management**: lightweight CMS or structured content (e.g. MD/MDX or a headless CMS)
- **Forms**: Google Forms (newsletter signup + volunteer intake)
- **Email / newsletter**: Mailchimp
- **Data / lightweight backend**: Airtable
- **Analytics**: privacy-friendly analytics (provider TBD)
- **Accessibility & QA**: automated checks (linting, link checking, a11y audits)
- **Hosting / deployment**: Vercel (production) + GitHub Pages (preview)

