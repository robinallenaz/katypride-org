Welcome to the Katy Pride website administration guide.  
This document explains how to manage website content using **Sanity Studio**.


## Getting Started

### Accessing Sanity Studio
1. Visit `https://katypride.org/studio`
2. Log in with your admin credentials
3. The content management dashboard will load

### Content You Can Manage
- **Events** – Community events and celebrations
- **Coffee Meetups** – Recurring meetup details and overrides
- **Resources** – LGBTQ+ organizations and support links
- **Form Links** – Buttons for applications and registrations
- **Page Content** – Page headings and introductory text


## Managing Events
### Adding a New Event
1. Select **Events** from the sidebar
2. Click **New event**
3. Complete the following fields:

- **Event Title**  
  Name of the event (example: *Katy Pride Celebration 2026*)

- **Start Date & Time**  
  When the event begins

- **End Date & Time** *(optional)*  
  When the event ends

- **Location**  
  Venue or location name

- **Event Description**  
  Detailed information (supports rich text formatting)

- **Event Image / Flyer**  
  Upload a promotional image

- **Registration / Tickets Link** *(optional)*  
  External registration page

- **Button Text** *(optional)*  
  Custom label for the registration button

- **Published**  
  Must be enabled for the event to appear publicly

### Event Display Rules
- Events appear in chronological order on `/events`
- Only future events are visible to visitors
- Past events are hidden automatically
- Unpublished events are visible only to admins


## Coffee Meetup Overrides

Coffee meetups normally occur on the **second Friday of each month**.

To customize a specific date:

1. Select **Coffee Meetup Overrides**
2. Click **New coffee meetup override**
3. Choose the date to customize
4. You may:
   - Cancel the meetup
   - Change the title, time, location, or address
   - Add a custom description or image
   - Add an RSVP link for special events


## Managing Resources

### Adding a Community Resource
1. Select **Resource Links**
2. Click **New resource link**
3. Complete the following:

- **Organization / Resource Name**
- **Website URL**  
  Must start with `https://`

- **Resource Category**
  - Health & Wellness
  - LGBTQ Advocacy
  - LGBTQ & Ally
  - Regional Pride
  - National Resources

- **Active**  
  Must be enabled to display publicly

### Resource Display Behavior
- Resources appear on the `/resources` page
- Automatically grouped by category
- Drag and drop to reorder within categories
- Inactive resources are hidden from visitors


## Managing Form Links

### Creating a Form Button
1. Select **Form Links**
2. Click **New form link**
3. Configure the following:

- **Button Text**  
  Label shown to visitors

- **Form URL**  
  Link to Google Form or external registration

- **Display Page**
  - Home (`/`)
  - Celebration (`/celebration`)
  - Volunteer (`/volunteer`)
  - Donate (`/donate`)
  - Events (`/events`)

- **Active**  
  Must be enabled to appear on the site

### Form Button Behavior
- Displays as a styled button
- Opens in a new browser tab
- Drag and drop to reorder
- Inactive buttons are hidden


## Managing Page Content

### Customizing a Page
1. Select **Page Content**
2. Click **New page content**
3. Choose the **Target Page**
4. Edit:
   - **Page Heading**
   - **Introduction Text** (rich text supported)

### Supported Pages
- Home (`/`)
- Celebration (`/celebration`)
- Volunteer (`/volunteer`)
- Donate (`/donate`)
- Events (`/events`)
- About (`/about`)

### Rich Text Capabilities
- Bold and italic text
- Links
- Bullet and numbered lists
- Headings
- Quotes and emphasis


## Previewing Changes

### Preview Mode (Recommended)
Preview allows you to see changes before publishing.

**Method 1: Preview Pages Panel**
1. Make changes in Sanity Studio
2. Leave content unpublished
3. Click **Preview Pages** in the sidebar
4. Open a page preview in a new tab

**Method 2: Manual Preview URLs**
1. Leave content unpublished
2. Add `?preview=true` to any page URL

Example preview pages:
- `/`
- `/about`
- `/events`
- `/calendar`
- `/advocacy`
- `/celebration`
- `/resources`

### Preview Indicators
- Yellow banner stating *Preview Mode*
- Displays unpublished content
- Visible only to admins


## Publishing Workflow
1. Review content in preview mode
2. Return to Sanity Studio
3. Click **Publish**
4. Changes go live immediately


## Maintenance Guidelines

### Recommended Update Frequency
- **Events** – Weekly during event season
- **Resources** – Quarterly
- **Forms** – When applications open or close
- **Page Content** – Seasonal updates


## Troubleshooting

### Event Not Visible
- Confirm **Published** is enabled
- Verify the start date is in the future

### Resource Link Issues
- Confirm URL starts with `https://`
- Ensure **Active** is enabled

### Form Button Missing
- Verify the correct display page is selected
- Ensure **Active** is enabled


## Mobile Considerations
- Test forms on mobile devices
- Keep text concise
- Use appropriately sized images
