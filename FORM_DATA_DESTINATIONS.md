# Katy Pride Website - Form Destinations & Data Flow

## Overview
All website forms submit to **GrowthSphere360 (GoHighLevel)** via the `/api/crm` API route.

---

## Form Data Destinations

### 1. Newsletter Signup (`/newsletter`)
**Component:** `NewsletterForm.tsx` → `/api/crm`

**Data Collected:**
- Name, Email, Phone (optional)
- Interests: Events, Volunteering, Advocacy, Youth Programs, Coffee Meetups, etc.

**CRM Tags Applied:**
- `community-member`
- Interest-specific tags (e.g., `Events & Celebrations`, `Volunteer Opportunities`)

**Access Data:**
- Log into GrowthSphere360: https://app.gohighlevel.com
- Go to **Contacts** → Filter by tag `community-member`
- Or search by email/name

---

### 2. Volunteer Form (`/volunteer`)
**Component:** `CRMContactForm` (type: volunteer) → `/api/crm`

**Data Collected:**
- Name, Email, Phone
- Areas of Interest (Event Planning, Community Outreach, Youth Programs, etc.)
- Availability preferences

**CRM Tags Applied:**
- `volunteer`
- Interest tags (e.g., `Event Planning`, `Youth Programs`)

**Access Data:**
- Log into GrowthSphere360
- Go to **Contacts** → Filter by tag `volunteer`
- View availability and interests in contact details

---

### 3. Vendor Registration (`/vendor-signup`)
**Component:** `VendorSignupForm.tsx` → `/api/crm` → Stripe Checkout

**Data Flow:**
1. Form submits to `/api/crm` with type `vendor`
2. CRM creates contact with vendor tags
3. Stripe Checkout session created for payment
4. Payment confirmation updates CRM with `paymentStatus: completed`

**CRM Tags Applied:**
- `vendor`
- `vendor-{type}` (e.g., `vendor-forprofit`, `vendor-nonprofit`, `vendor-food`)
- `katy-pride-celebration-2026`

**Vendor Fees (Celebration 2026):**
- Non-Profit: $225
- For-Profit: $275
- Food Vendor: $300
- Political: $300
- Government: $300

**Access Data:**
- Log into GrowthSphere360
- Go to **Contacts** → Filter by tag `vendor`
- View company info, vendor type, payment status in custom fields

---

### 4. 5K Sponsor Signup (`/sponsor-5k`)
**Component:** `SponsorSignupForm.tsx` → `/api/crm` → Stripe Checkout OR Invoice

**Data Flow:**
1. Form submits to `/api/crm` with type `sponsor`
2. CRM creates contact with sponsor tags
3. If "Want Invoice" checked: Contact saved, invoice sent manually
4. If immediate payment: Stripe Checkout session created
5. Payment goes directly to your connected Stripe account

**CRM Tags Applied:**
- `sponsor`
- `sponsor-{level}` (e.g., `sponsor-bronze`, `sponsor-gold`)
- `event-chase-the-rainbow-5k-2026`

**Sponsorship Levels (5K):**
- Water Station: FREE
- Community: $100
- Bronze: $250
- Color Run: $350
- Silver: $500
- Kids Dash: $1,000
- Gold: $1,000
- Presenting: $2,500

**Access Data:**
- Log into GrowthSphere360
- Go to **Contacts** → Filter by tag `sponsor`
- View sponsorship level in custom fields

---

## Payment Processing

### Where Do Funds Go?

**Vendor Payments & 5K Sponsorships:**
1. User completes Stripe Checkout
2. Funds go to **your Stripe account** (live account, not test)
3. Stripe transfers to your connected bank account (2-7 business days)

**Access Stripe Dashboard:**
- https://dashboard.stripe.com
- View payments, refunds, payouts

### Test Cards Rejected
Kristina's test card was rejected because Stripe detected it as a known test number. This is **expected security behavior**. For testing, use Stripe's official test cards:
- `4242 4242 4242 4242` (Visa test)
- Any future expiry date
- Any 3-digit CVC
- Any ZIP

---

## Admin Dashboard

View all contacts in one place:
- **URL:** `/admin/crm` on your website
- Requires CRM_ADMIN_SECRET from environment variables
- Shows total contacts, volunteers, donors, vendors, sponsors
- Lists recent submissions with tags

---

## Questions?

Contact: info@katypride.org
