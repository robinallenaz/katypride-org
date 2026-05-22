# Vendor & Sponsor Form Issue — Board Summary

**Status as of May 22, 2026:** Vendor and sponsor form submissions are showing an error message on the website. **No data has been lost.** Every submission is still being saved permanently in our database.

---

## What's happening (in plain English)

When someone fills out the vendor or sponsor form on katypride.org and clicks Submit, they see an error message ("CRM request failed").

The form is **not actually broken** — the data is still being captured. What's broken is the connection between our website and our CRM system (GrowthSphere360, which is built on a platform called GoHighLevel).

---

## The leading theory: why this is happening

Think of our CRM like a phone system with two phone numbers:

- **Old number (called the "v1 API")** — the one our website has been calling for years
- **New number (called the "v2 API")** — a newer line GoHighLevel has been pushing customers to switch to

For a long time, GoHighLevel kept both numbers active so older websites like ours wouldn't break. **It appears they recently disconnected the old number, either for everyone or specifically for our account.**

Every time our website tries to call the old number, it gets a "this number is no longer in service" response (technically, a 404 error with no message). Yesterday it worked. Today it doesn't. We didn't change anything on our end.

### Why we believe this is the cause

1. The error pattern (404 with an empty response) is consistent with an endpoint being shut off entirely — not an authentication problem or a typo
2. Generating a brand-new API key in our CRM dashboard didn't fix it, which rules out the key being expired
3. Our payment processor (Stripe) is unaffected and working normally — the issue is isolated to the CRM connection
4. Other parts of our website (events, calendar, admin tools) work fine

### What we're doing about it

The fix is to update our website's code to call the new "phone number" instead of the old one. This is called a **v2 API migration**. It's not a quick toggle — the new system uses different authentication and slightly different request formats — but it's a well-defined piece of work that can be done in a single session.

---

## Where form data is stored (4 places)

Even though the CRM is currently unreachable, **every submission is being saved in multiple places simultaneously**:

### 1. PostgreSQL database (permanent, encrypted)
- **Hosted by:** Neon, accessed through our Vercel hosting account
- **Table name:** `form_submissions`
- **Each row contains:**
  - Timestamp of submission
  - Type (vendor, sponsor, volunteer, etc.)
  - Name and email
  - **The complete form contents** (every field they filled in) stored as structured data
  - A flag showing whether the CRM accepted the submission (`true`) or rejected it (`false`)
- **Where to access:** Vercel dashboard → Storage → Neon database. A board member with database access can run a query like `SELECT * FROM form_submissions ORDER BY timestamp DESC;` to see every submission.

### 2. JSON backup file on the server
- **File path:** `/data/form-backup.json`
- **Contents:** The most recent 1,000 submissions (older entries automatically pruned)
- **Note:** This is a secondary safety net. Because our hosting (Vercel) resets server files on each deployment, this file is not as durable as the database. The PostgreSQL database is the authoritative copy.

### 3. Stripe (for vendors who paid online)
- **Account:** Our Stripe dashboard at dashboard.stripe.com
- **What's stored:** Full payment records — amount, card last 4 digits, customer email, receipt, status, plus metadata like vendor type and promo code used
- **Permanence:** Kept indefinitely by Stripe for financial-records compliance
- **Status:** Unaffected by the CRM issue. Payments going through normally.

### 4. GoHighLevel CRM (GrowthSphere360) — *currently failing*
- **Account location ID:** `Jv1MoTe2L64G9v7k0fxz`
- **Normally stores:** Contact records with tags, notes, and pipeline opportunities (sponsorship interest, vendor agreements, etc.)
- **Status:** Submissions from the last ~24 hours have NOT reached this system. They are flagged in the database with `crm_success = false` so we know exactly which ones to re-send once the connection is fixed.

---

## What gets recovered after the fix

Once the CRM connection is restored, we can pull all the failed submissions out of the PostgreSQL database (every row where `crm_success = false`) and re-send them to GrowthSphere360. Vendors and sponsors who submitted during the outage will then appear in the CRM as if nothing happened.

---

## What board members should know

| Question | Answer |
|---|---|
| Is anyone's data lost? | **No.** Every submission is in our database. |
| Are payments affected? | **No.** Stripe is working normally. Vendors who completed payment have been charged successfully. |
| What do vendors who saw the error see? | A red "CRM request failed" message. They would need to be told their submission was actually captured, or asked to resubmit once fixed. |
| When will it be fixed? | Pending a code update (v2 API migration). Estimated: a few hours of development plus deployment. |
| Do we need to contact GoHighLevel? | Yes — confirming with their support that v1 is sunset for our account would let us prioritize the migration with certainty. |
| What if a vendor needs proof of submission? | We can look them up by email in the `form_submissions` table and confirm timestamp, vendor type, and payment status. |

---

## Key files referenced (for the developer)

- `src/lib/ghl.ts` — the connection point currently calling the old "phone number"
- `src/app/api/crm/route.ts` — handles incoming form submissions, writes to all storage destinations
- `src/lib/data-service.ts` (`saveFormSubmissionToDb`) — writes each submission to PostgreSQL
- `src/lib/ghl-pipeline.ts` — manages sponsor opportunities in the CRM pipeline
- `src/app/api/track-payment/route.ts` — Stripe webhook that triggers the vendor-agreement email after payment

---

*Document prepared May 22, 2026. Update once v2 migration is complete and CRM connection restored.*
