# Katy Pride — Website Revamp Tech Stack Proposal

## Summary
We propose rebuilding katypride.org on a modern, low‑maintenance stack: **Next.js + Airtable + Cloudinary + Vercel**. This setup delivers a fast, SEO‑friendly site that non‑technical staff can update without a developer, while keeping hosting and operational costs near zero.

---

## The Stack

| Component | What it does | Why it fits a 501c3 with limited budget |
|-----------|--------------|------------------------------------------|
| **Next.js (App Router)** | Modern React framework; server‑first rendering by default | - Fast performance and SEO out of the box<br>- Minimal client JavaScript → lower data usage for visitors<br>- Built‑in image optimization, caching, and security features |
| **Airtable** | Simple spreadsheet‑like database (CMS) | - Non‑technical staff can edit content (news, events, pages) in a familiar UI<br>- No separate CMS fees for basic usage (generous free tier)<br>- Real‑time updates go live without a deploy |
| **Cloudinary** | Image hosting, optimization, and CDN | - Automatic resizing, compression, and next‑gen formats<br>- Pay‑as‑you‑go; free tier covers most small‑org needs<br>- Improves site speed and accessibility (CLS, LCP) |
| **Vercel** | Hosting and deployment platform | - Free for hobby/standard usage (fits our traffic)<br>- Automatic HTTPS, global CDN, and edge caching<br>- Deploy on every git push with zero config |

---

## How It Works (Non‑Technical Overview)

1. **Content lives in Airtable**  
   - News/blog posts, events, and basic pages are rows in Airtable tables.  
   - Staff edit them just like a Google Sheet—no code needed.

2. **Images live in Cloudinary**  
   - Upload once; Cloudinary creates optimized versions for every device.  
   - In Airtable, we just reference the image by name or ID.

3. **The website pulls from Airtable and Cloudinary**  
   - When a visitor loads the site, Next.js fetches the latest content from Airtable and images from Cloudinary.  
   - Updates in Airtable appear on the site almost instantly.

4. **Hosting on Vercel**  
   - The site is automatically published and kept fast/secure worldwide.  
   - No servers to manage.

---

## Pros

- **Low ongoing cost**: Airtable free tier + Cloudinary free tier + Vercel free tier ≈ $0–$20/month depending on traffic/image volume.
- **Easy content updates**: No developer needed for news, events, or simple page changes.
- **Fast and SEO‑friendly**: Next.js server rendering + optimized images → better search rankings and user experience.
- **Secure and reliable**: Vercel handles HTTPS, CDN, and scaling; Cloudinary handles image delivery.
- **Future‑proof**: Easy to add features (donations, forms, member areas) without rebuilding the foundation.

---

## Cons / Considerations

- **Airtable limits**: Very high traffic or huge image libraries may eventually exceed free tiers (still affordable to upgrade).
- **Vendor lock‑in**: Moving away from Airtable/Cloudinary later would require a migration.
- **Learning curve**: Staff will need a brief intro to Airtable (but it’s spreadsheet‑like).

---

## Cost Estimate (First Year)

| Service | Approx. Cost | Notes |
|---------|--------------|-------|
| Vercel (Pro) | $0–$20/mo | Free tier likely sufficient; Pro adds more bandwidth/functions |
| Airtable (Plus) | $0–$10/mo | Free plan often enough; Plus adds more records/attachments |
| Cloudinary | $0–$89/mo | Free tier covers ~25 credits/month; scales with usage |
| Domain (katypride.org) | $10–$15/yr | Existing domain |
| **Total** | **~$0–$150/yr** |  |

---

## Migration Plan (High‑Level)

1. **Audit current content** (pages, news, events, images) → 1 week  
2. **Set up Airtable base and Cloudinary account** → 1 day  
3. **Build Next.js site skeleton with nav and pages** → 1 week  
4. **Import content and configure Airtable sync** → 1 week  
5. **Test, SEO setup, and launch on Vercel** → 1 week  

**Total timeline**: ~4–5 weeks part‑time.

---

## Decision Points for the Board

- **Do we want staff to edit news/events without a developer?** → Yes → Airtable CMS  
- **Is keeping hosting/maintenance costs near zero a priority?** → Yes → Vercel free tier + pay‑as‑you‑go images  
- **Do we need advanced features now (donations, members, complex forms)?** → If not, we can add them later without rebuilding.

---

## Next Steps

- Approve stack and budget allocation (if any).
- Share current site content inventory (pages, news, events) so we can design the Airtable tables.
- We’ll set up a demo/staging site on Vercel for review before launch.

---

### TL;DR

> **Next.js + Airtable + Cloudinary + Vercel** gives us a fast, easy‑to‑update website at almost no ongoing cost—perfect for a 501c3 with limited budget and non‑technical content editors.
