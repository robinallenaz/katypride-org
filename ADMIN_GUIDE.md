

Welcome to the Katy Pride website administration guide. This document explains how to manage website content using **Strapi CMS**.

## Getting Started

### Content You Can Manage

- **Events** – Community events and celebrations (katypride.org/events)
- **Coffee Meetups** – Recurring coffee meetup details (katypride.org/events)
- **Resources** – LGBTQ+ organizations and support links (katypride.org/resources)
- **Form Links** – Buttons that link to external forms and registration pages
- **Page Content** – Page headings and introductory text
- **Carousel Images** – Photos displayed in the home page carousel
- **Website Images** – General image library for website use

## Accessing the Admin Panel

**Development:** `http://localhost:3000/admin`  
**Production:** `https://your-backend-name.vercel.app/admin`

The admin panel is powered by Strapi CMS and provides an intuitive interface for managing all website content.

### Production Setup
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment instructions.

## Managing Events

### Adding a New Event

1. **Select Events** from the sidebar
2. **Click New event**
3. **Fill in details:**

**Required:**

- **Event Title** (e.g., "Katy Pride Celebration 2026")
- **Start Date & Time**
- **Location**

**Optional:**

- **End Date & Time**
- **Event Description** (supports bold, italics, links)
- **Event Image / Flyer**
- **Registration / Tickets Link**
- **Button Text** (custom registration button text)
- **Event Category** (General Event or Coffee Meetup)
- **Published** (enable to show on website)

**💡Tip** Use the Strapi admin panel to preview your content before publishing!

### Coffee Meetup Events

Coffee meetups are now managed as regular events with the **Coffee Meetup** category:

- **Default Schedule**: Second Friday of each month at 8:00 AM
- **Default Location**: Coffee Fellows (3329 Grand Parkway, Katy, TX 77449)
- **Customization**: Create a coffee meetup event to override the default for a specific date
- **Cancellation**: Don't create an event for a date you want to cancel

**To customize a coffee meetup:**
1. Create a new event with **Event Category** set to "Coffee Meetup"
2. Set the date to the specific Friday you want to customize
3. Customize title, time, location, description, or add RSVP link
4. Leave a date without an event to cancel that month's meetup

### Event Display Rules

- Events appear chronologically on `/events`
- Only future, published events are visible to visitors
- Past events and unpublished events are hidden automatically
- Coffee meetups without custom events show default recurring schedule

## Managing Calendar Settings

### Configuring Google Calendar

1. **Select Calendar Settings** from the sidebar
2. **Edit the settings document** (there should only be one)
3. **Complete the fields:**

**Required:**

- **Google Calendar ID** - The calendar ID to embed (find in Google Calendar settings under "Integrate calendar")
- **Time Zone** - Time zone for calendar display (e.g., America/Chicago)

**Optional:**

- **Calendar Title** - Title displayed on the Calendar page
- **Calendar Description** - Description displayed on the Calendar page  
- **Show Subscribe Buttons** - Toggle to show/hide Google Calendar and iCal subscribe buttons

**💡 Finding Your Calendar ID:**
1. Open your Google Calendar
2. Go to Settings → Click on the calendar name
3. Scroll to "Integrate calendar" section
4. Copy the Calendar ID (it looks like an email address)

**💡 Making Calendar Public:**
1. In Google Calendar settings, find "Access permissions"
2. Select "Make available to public"
3. Choose "See all event details" for full visibility

## Managing Resources

### Adding a Resource

1. **Select Resource Links**
2. **Click New resource link**
3. **Complete the fields:**

 **Organization / Resource Name**
- **Website URL** (must start with `https://`)
- **Resource Category** (Health & Wellness, LGBTQ Advocacy, LGBTQ & Ally, Regional Pride, National Resources)
- **Active** (enable to display)

Resources are grouped by category. Drag and drop to reorder within categories.

## Managing Form Links

### Creating a Form Button

1. **Select Form Links**
2. **Click New form link**
3. **Configure:**

   • Button Text<br>
   • Form URL<br>
   • Display Page (Home, Celebration, Volunteer, Donate, or Events)<br>
   • Active (enable to appear)<br><br>

Buttons open in a new tab. Drag and drop to reorder them.

## Managing Carousel Images

### Adding a Carousel Image
1. **Select Carousel Images** from the sidebar
2. **Click New carousel image**
3. **Complete the fields:**

• Image Title - Descriptive name for the image<br>
• Image - Upload the photo (supports drag and drop)<br>
• Alternative Text - Important for accessibility and SEO<br>
• Active - Enable to show in carousel<br><br>

**💡 Tips:**
- Images automatically display in the order they were created (oldest first)
- Use the drag-and-drop interface to reorder images visually
- Use high-quality images (minimum 1200px width) for best results

### Managing Website Images

1. **Select Website Images** from the sidebar
2. **Click New website image**
3. **Complete the fields:**

• Image Name - Descriptive name<br>
• Image - Upload the photo<br>
• Image Category - Choose appropriate category (Hero, Event, Celebration, Advocacy, Resource, General)<br>
• Active - Enable to use on website<br>
• Notes - Optional usage instructions

## Managing Page Content

1. **Select Page Content**
2. **Click New page content**
3. **Choose the target page** (Home, Celebration, Volunteer, Donate, Events, or About)
4. **Edit the page heading and introduction text** (supports rich text: bold, italic, links, lists, headings, quotes)

## Previewing Changes

Preview unpublished changes before going live:

**Option 1:** Use the Strapi admin panel's preview functionality<br><br>

**Option 2:** Add `?preview=true` to any page URL (e.g., `/events?preview=true`)<br><br>

A yellow "Preview Mode" banner indicates you're viewing unpublished content (visible only to admins).

## Publishing Workflow

1. Review content in preview mode
2. Return to Strapi admin panel
3. Click **Publish**
4. Changes go live immediately

## Maintenance Guidelines

- **Events** – Weekly during event season
- **Resources** – Quarterly
- **Forms** – When applications open/close
- **Page Content** – Seasonal updates

## Troubleshooting

- **Event not visible:** Confirm it's published and the start date is in the future
- **Resource link issues:** Verify URL starts with `https://` and is marked active
- **Form button missing:** Confirm correct display page is selected and it's marked active


For updates or questions, contact robin@katypride.org
