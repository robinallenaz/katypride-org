# 🌈 Katy Pride Website Admin Guide (Non-Technical)

> **A Simple Guide for Board Members and Volunteers**
>
> This guide explains how to manage the Katy Pride website **without any technical knowledge**. 
>
> ⚠️ **Important**: Most website content (events, photos, pages) requires technical assistance to update. This guide covers what you **can** manage yourself (forms, contacts, submissions) and how to request content changes.

---

## 📚 Table of Contents

1. [What You Can Manage vs. What Needs Tech Help](#what-you-can-manage-vs-what-needs-tech-help)
2. [Managing Events](#managing-events)
3. [Vendor & Sponsor Signup Process](#vendor--sponsor-signup-process)
4. [Viewing Form Submissions](#viewing-form-submissions)
5. [Managing the Newsletter](#managing-the-newsletter)
6. [Requesting Website Changes](#requesting-website-changes)
7. [Your Daily & Weekly Tasks](#your-daily--weekly-tasks)
8. [Getting Help](#getting-help)

---

## What You Can Manage vs. What Needs Tech Help

### ✅ You Can Manage Yourself (Through Admin Panel)

| Task | Where | How |
|------|-------|-----|
| **Add/Edit Events** | `/admin/events` | Click "Add Event" or "Edit" on existing events |
| **Change Homepage Photos** | `/admin/carousel` | Add, edit, or remove carousel images |
| **Add/Edit Resources** | `/admin/resources` | Manage resource links and community organizations |
| **View Form Submissions** | `/admin/submissions` | See who's signing up for vendor, sponsor, volunteer |
| **Access Contact Database** | GrowthSphere360 CRM | Manage volunteers, vendors, donors |
| **Send Newsletters** | GrowthSphere360 CRM | Email campaigns to subscribers |

### 🔧 Requires Technical Help (Contact Developer)

| Task | Why It Needs Help | Who to Contact |
|------|-------------------|----------------|
| **Edit page text** (About, Volunteer, etc.) | Requires code updates | Tech team / robin@katypride.org |
| **Update vendor/sponsor pricing** | Requires code changes | Tech team |
| **Add new pages** | Requires development | Tech team |
| **Fix website bugs** | Requires development | Tech team |
| **Payment processing issues** | Stripe configuration | Tech team |

---

## Managing Events

### How to Add or Edit Events

**Good news!** You can manage events directly through the admin panel—no technical help needed.

### Adding an Event

1. **Go to** [katypride.org/admin](https://katypride.org/admin)
2. **Log in** with your @katypride.org email and admin password
3. **Click "Events"** (or go directly to `/admin/events`)
4. **Click "+ Add Event"** button
5. **Fill in the details**:
   - **Title**: Event name (e.g., "Pride Night at Momentum - April 2026")
   - **Category**: Select from dropdown (Social, Fundraising, Coffee Meetups, etc.)
   - **Start Date/Time**: When the event begins
   - **End Date/Time**: When it ends (optional but recommended)
   - **Location**: Full address with venue name
   - **Image URL**: Path to event photo (e.g., `/event-photo.jpg`)
   - **Image Alt Text**: Description for accessibility (e.g., "People dancing at Pride celebration")
   - **External URL**: Link to registration page (optional)
   - **Button Label**: Text for the link button, like "Register" or "Learn More"
   - **Description**: Brief summary of what's happening
6. **Click "Save Event"**
7. **Done!** The event appears on the website immediately

### Editing an Event

1. Go to `/admin/events`
2. Find the event in the list
3. Click **"Edit"**
4. Make your changes
5. Click **"Save Event"**

### Deleting an Event

1. Go to `/admin/events`
2. Find the event
3. Click **"Delete"**
4. Confirm the deletion

### Coffee Meetups

Coffee meetups happen **automatically** on the website:
- **When**: Second Friday of every month at 8:00 AM
- **Where**: Coffee Fellows (3329 Grand Parkway, Katy, TX)

**To customize a coffee meetup** (different time, location, or special theme):
1. Create a new event with category **"Coffee Meetups"**
2. Set the date to the specific Friday
3. The custom event will override the default for that date

**To cancel a coffee meetup** for a specific month:
1. Create an event for that date with a note in the title like "CANCELLED"
2. Or email the tech team to temporarily disable it

### Event Best Practices

- ✅ **Create events 2+ weeks early** for better attendance
- ✅ **Use photos**—events with images get more engagement
- ✅ **Include the full address** with parking info
- ✅ **Set an end time** so people know how long it lasts
- ✅ **Keep descriptions short** (2-3 sentences work best)
- ❌ **Don't use ALL CAPS** in the event name
- ❌ **Don't leave required fields blank** (title, category, start date)

### Events Page vs. Facebook Events

- **Website Events**: You manage these directly in `/admin/events`—they show on katypride.org/events
- **Facebook Events**: Create these separately for social sharing and RSVPs
- **They don't sync**: You need to create events in both places if you want them on both platforms

> 💡 **Best Practice**: Create the event in the admin panel first (for the website), then copy the details to Facebook.

---

## Vendor & Sponsor Signup Process

### How It Works (The Full Flow)

When someone applies to be a vendor or sponsor, here's what happens:

```
Applicant fills out form → Data saved to CRM → Payment processing → Contract sent
```

### Current Status: Stripe Payment System (In Progress)

⚠️ **Payment processing is being set up but not fully active yet.**

**What's Working:**
- ✅ Vendor/sponsor forms capture all information
- ✅ Data automatically goes to GrowthSphere360 CRM
- ✅ Admin panel shows all submissions
- ✅ Form validation and security working

**What's Being Set Up:**
- 🔄 **Stripe payment integration** - Allows online payment by credit card
- 🔄 **Automatic contract emails** - Sends vendor agreement after payment
- 🔄 **Payment status tracking** - Shows who's paid in the admin panel

**Current Payment Process (Until Stripe is Ready):**
1. Vendor/sponsor submits form
2. You receive notification in admin panel
3. You manually send them an invoice or payment link
4. They pay via check, bank transfer, or other method
5. You mark them as "paid" in the CRM manually

### Vendor Application Workflow

**Step 1: Application Submitted**
- Vendor fills out form at `/vendor-signup`
- Information automatically saved to CRM with "vendor" tag
- Appears in your admin panel immediately

**Step 2: Review Application**
1. Check `/admin/submissions` for new vendor entries
2. Review their company info, products/services, vendor type
3. Verify they meet requirements (not a prohibited business type)

**Step 3: Request Payment**
**Option A** (When Stripe is active): They pay online automatically
**Option B** (Current process): 
- Email them an invoice with payment instructions
- Vendor fees: Non-Profit $225, For-Profit $275, Food $300, Political/Government $275

**Step 4: Send Contract**
- After payment received, email them the vendor agreement
- They must sign and return it

**Step 5: Confirm Participation**
- Mark them as "confirmed" in your tracking
- Add them to the vendor list for the event

### Sponsor Application Workflow

Similar to vendors but with different tiers:

**Sponsorship Levels:**
- Friends of Pride: $250
- Rainbow: $500
- Silver: $1,000
- Gold: $2,500
- Platinum: $5,000
- Title: $10,000

**Plus Exclusive Opportunities:**
- Entertainment Stage: $7,500
- Hospitality: $5,000
- T-Shirt: $5,000
- WiFi/Charging: $5,000
- Swag Bag: $5,000
- Kid Zone: $3,000

**Follow the same workflow**: Form → Review → Payment → Contract → Confirm

### Tracking Payments

**Until Stripe is fully active:**
- Check your email for payment notifications
- Update CRM manually with "paid" tag when payment received
- Keep a separate spreadsheet if needed for tracking

**When Stripe is active:**
- You'll see payment status directly in the admin panel
- Automatic receipts sent to vendors/sponsors
- Payment data synced with CRM

> � **Stripe Status Questions?** Contact robin@katypride.org for updates on when online payments will be ready.

---

## Managing Resource Links

The resources page lists LGBTQ+ organizations and support services. You can manage these directly through the admin panel.

### Adding a New Resource

1. **Go to** [katypride.org/admin](https://katypride.org/admin)
2. **Log in** with your @katypride.org email and password
3. **Click "Resources"** (or go to `/admin/resources`)
4. **Click "Add Resource"**
5. **Fill in the details**:
   - **Title**: Organization name (e.g., "The Montrose Center")
   - **URL**: Website address (must start with `https://`)
   - **Category**: Select the appropriate category
     - Crisis Support
     - Family Support
     - Community Services
     - Advocacy
     - Legal Support
     - Healthcare
     - Youth Services
     - Education
   - **Description**: Briefly explain what services they offer (1-2 sentences)
6. **Click "Save"**
7. **Done!** The resource appears on the website immediately

### Editing or Removing Resources

1. Go to `/admin/resources`
2. Find the resource in the list
3. Click **"Edit"** to update information
4. Click **"Delete"** to remove it

### Resource Best Practices

- ✅ **Verify links work** before adding (test the URL)
- ✅ **Include descriptions** explaining what the organization does
- ✅ **Choose appropriate categories** for easy browsing
- ✅ **Keep information current**—update if organizations change
- ❌ **Don't add**: Broken links or inactive organizations

---

### Current Newsletter System (GrowthSphere360)

Right now, newsletters are managed through the same CRM system that stores your contacts (GrowthSphere360, which is a white-label version of GoHighLevel).

### How to Send a Newsletter Today

1. **Log into** [app.gohighlevel.com](https://app.gohighlevel.com)
2. **Go to "Marketing" → "Email Campaigns"**
3. **Click "New Campaign"**
4. **Choose your audience**:
   - All newsletter subscribers (tag: "newsletter")
   - Just volunteers (tag: "volunteer")
   - Just vendors (tag: "vendor")
   - Custom selection
5. **Write your email**:
   - Subject line
   - Email body (you can add images, links, etc.)
6. **Preview and test**—send a test to yourself first!
7. **Schedule or send** the newsletter

### Future: Switching to Mailchimp

The board is considering **Mailchimp** for newsletters because it has:
- Better email templates (prettier designs)
- Easier drag-and-drop editor
- Better tracking (see who opened your email)
- Free for up to 2,000 subscribers

**If you switch to Mailchimp later:**
1. All your current subscribers can be exported from GrowthSphere360
2. Import them into Mailchimp (one-time setup)
3. Use Mailchimp's tools to create and send newsletters
4. Website signup forms will connect to Mailchimp instead

> 📅 **Timeline**: This is planned for mid-2026. Until then, use GrowthSphere360.

### Newsletter Content Ideas

**What to include in your newsletter:**
- 🎉 **Upcoming events** (2-3 things happening soon)
- 📸 **Photos** from recent events
- 💡 **Community spotlight** (feature a volunteer or sponsor)
- 📢 **Important announcements** (new programs, policy updates)
- ❤️ **Thank you** to recent donors
- 🔗 **Quick links** (volunteer signup, donate page, event calendar)

**Best practices:**
- ✅ **Send monthly**—not too often, not too rare
- ✅ **Keep it short**—people skim on phones
- ✅ **Use photos**—breaks up text and looks nice
- ✅ **Always include an unsubscribe link** (legally required)
- ✅ **Proofread**—ask someone else to check for typos
- ❌ **Don't send more than twice a month** (unless it's urgent)
- ❌ **Don't buy email lists**—only email people who signed up

---

## Managing Homepage Photos (Carousel)

The slideshow of photos on the homepage can be changed directly through the admin panel.

### Adding a New Carousel Image

1. **Go to** [katypride.org/admin](https://katypride.org/admin)
2. **Log in** with your @katypride.org email and password
3. **Click "Carousel"** (or go to `/admin/carousel`)
4. **Click "Add Image"**
5. **Fill in the details**:
   - **Image URL**: The web address of the photo
     - Use an existing image: `/photo-name.jpg`
     - Or external: `https://example.com/photo.jpg`
   - **Alt Text**: Describe the image for accessibility (e.g., "Volunteers at Pride 2025")
   - **Caption** (optional): Brief text that appears with the image
6. **Click "Save"**
7. **Done!** The image appears on the homepage immediately

### Tips for Great Carousel Images

- ✅ **High-quality photos** from recent events with people in them
- ✅ **Landscape orientation** (horizontal) works best
- ✅ **Clear, well-lit** images showing happy community members
- ✅ **Current events**—update regularly with fresh photos
- ✅ **At least 1200px wide** for best display
- ❌ **Avoid**: Blurry, dark, or outdated photos

### Editing or Removing Images

1. Go to `/admin/carousel`
2. Find the image you want to change
3. Click **"Edit"** to modify the caption or alt text
4. Click **"Delete"** to remove it from the homepage

---

## Your Daily & Weekly Tasks

### Daily Tasks (5 Minutes)

☐ **Check form submissions**  
→ Go to `/admin/submissions` and review new entries

☐ **Check your email**  
→ Look for any website-related questions or issues

### Weekly Tasks (15-20 Minutes)

☐ **Add website events** for the next 2-3 weeks  
→ Go to `/admin/events` and create events for upcoming activities

☐ **Create Facebook events** for the same events  
→ Make events on Facebook for social sharing (separate from website)

☐ **Review upcoming events**  
→ Make sure details are correct and no conflicts

☐ **Check newsletter subscribers**  
→ See if you have new signups to welcome

☐ **Update homepage photos if needed**  
→ Go to `/admin/carousel` and add fresh images from recent events

☐ **Review website** on your phone  
→ Make sure everything looks good on mobile

### Monthly Tasks (30 Minutes)

☐ **Send newsletter**  
→ Compile events, news, and updates

☐ **Add next month's events to website**  
→ Go to `/admin/events` and create events for next month

☐ **Update resources if needed**  
→ Go to `/admin/resources` to add or update community organizations

☐ **Review vendor/sponsor applications**  
→ Follow up with anyone who hasn't paid or signed contracts

☐ **Plan next month's content**  
→ What events, announcements, or updates are coming? Create them in `/admin/events`

---

## Getting Help

### When to Contact Technical Support

Contact **robin@katypride.org** or the tech team if:
- The website is completely down
- Forms aren't submitting
- You can't log into the admin panel
- Something looks broken or wrong
- You need a new feature or page

### When to Ask Another Admin

Ask a fellow board member if:
- You're not sure how to word something
- You want feedback on a photo or event description
- You need help proofreading
- You're unsure about a process

### Quick Troubleshooting

**Problem**: I need to add an event to the website  
**Solution**: Go to `/admin/events` and click "Add Event". Fill in the details and save—no tech team needed!

**Problem**: I can't log into the admin panel  
**Solution**:
1. Make sure you're using the right URL: `katypride.org/admin`
2. Check that you're using a **@katypride.org email address**
3. Check that Caps Lock is off
4. Try resetting your password
5. Contact tech support if still stuck

**Problem**: An event isn't showing on the website  
**Solution**:
1. Check that you saved it in `/admin/events`
2. Verify the event date is in the future (past events hide automatically)
3. Check that required fields (title, category, start date) are filled
4. Contact tech team if still not appearing

**Problem**: Someone said they submitted a form but I don't see it  
**Solution**:
1. Check both the admin panel (`/admin/submissions`) AND the CRM (GrowthSphere360)
2. Ask them what date/time they submitted
3. Check your spam/junk email folder
4. It might be a technical issue—contact support

**Problem**: Vendor says they tried to pay online but couldn't  
**Solution**:
1. Stripe online payments are still being set up
2. Send them a manual invoice with payment instructions (check, bank transfer, etc.)
3. Update their record in CRM when payment received

---

## Summary Cheat Sheet

| I Want To... | What To Do | Details |
|--------------|-----------|---------|
| **Add an event** | `/admin/events` | Click "Add Event", fill in details, save |
| **Edit an event** | `/admin/events` | Find event, click "Edit", make changes |
| **Change homepage photo** | `/admin/carousel` | Add, edit, or remove carousel images |
| **Add a resource link** | `/admin/resources` | Click "Add Resource", fill in details |
| **See who volunteered** | `/admin/submissions` | Go to `/admin/submissions` and review |
| **See vendor/sponsor applications** | `/admin/submissions` | Follow the [vendor workflow](#vendor--sponsor-signup-process) above |
| **Send a newsletter** | GrowthSphere360 CRM | Marketing → Email Campaigns |
| **Edit page text** | Email tech team | Send exact text to robin@katypride.org |
| **Check all submissions** | `/admin/submissions` | Filter by type, review details |
| **Need other website changes** | Email tech team | robin@katypride.org with clear details |

---

## Remember: You Can't Break It!

The website is designed to be **safe to use**. Even if you make a mistake:
- Content can be unpublished or edited again
- Photos can be replaced
- Text can be rewritten
- Someone else can help fix it

**Don't be afraid to try things!** If you're unsure, make a test entry first to see how it works.

---

*This guide is a living document. If something is confusing or you have suggestions for improvement, please share feedback with the tech team.*

**Last Updated**: April 2026  
**Questions?** Email info@katypride.org with "Admin Guide Question" in the subject line.
