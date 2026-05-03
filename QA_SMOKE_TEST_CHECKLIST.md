# QA Smoke Test Checklist

Use this checklist after deployments or significant backend/admin changes.

## Prep (2 minutes)

- [ ] Open production site in one browser tab.
- [ ] Open admin dashboard in another tab (`/admin` → CRM dashboard).
- [ ] Use unique test values (timestamp in name/email), for example:
  - `QA Volunteer 2026-04-11 15:30`
  - `qa+volunteer-1530@example.com`

---

## 1) Volunteer form → CRM dashboard

- [ ] Submit `/volunteer` with valid required fields.
- [ ] Confirm success message on form page.
- [ ] In admin CRM dashboard, click **Refresh Data**.
- [ ] Verify contact appears in **Recent Contacts**.
- [ ] Open **View Details** and confirm:
  - Name/email/phone are correct
  - Relevant volunteer tag(s) present
  - Submission details/notes visible

**Pass if:** contact is visible with expected details and tags.

---

## 2) Vendor form → CRM dashboard

- [ ] Submit `/vendor-signup` with valid data.
- [ ] Confirm success message.
- [ ] Refresh admin CRM dashboard.
- [ ] Verify contact appears with vendor tags/details.
- [ ] Expand details and confirm:
  - Company/address/vendor type fields are present
  - Notes/custom fields include vendor-specific info

**Pass if:** vendor submission is captured and visible to admins.

---

## 3) Sponsor form (invoice path) → CRM dashboard

- [ ] Submit `/sponsor-5k` (or celebration sponsor page) with **Want Invoice** checked.
- [ ] Confirm success message (no card payment attempted).
- [ ] Refresh admin CRM dashboard.
- [ ] Verify sponsor contact appears with sponsor/event tags and note details.

**Pass if:** sponsor lead appears and is viewable in admin.

---

## 4) Donation + payment (Stripe) end-to-end

Use Stripe test card:

- Card: `4242 4242 4242 4242`
- Exp: any future date
- CVC: any 3 digits
- ZIP: any valid ZIP

Steps:

- [ ] Go to `/donate`.
- [ ] Complete Step 1 contact info.
- [ ] In Step 2, choose amount + card and submit.
- [ ] Confirm redirect to donation success page.
- [ ] Refresh CRM dashboard and verify donor contact/payment-related note or fields updated.

**Pass if:** payment succeeds and donor record is visible in admin CRM.

---

## 5) Admin media regressions (carousel + site images)

- [ ] Log into `/admin/carousel`.
- [ ] Upload a new carousel image and save.
- [ ] Edit same entry, replace image, save again.
- [ ] Delete an image and confirm no errors.
- [ ] Log into `/admin/site-images`, update board photo, save.
- [ ] Visit `/about` and confirm board photo/caption updates are visible.

**Pass if:** all actions succeed and site renders updated media.

---

## Go / No-Go rule

- **GO** if all 5 sections pass.
- **NO-GO** if any section fails.

If a section fails:

1. Capture exact page + timestamp + screenshot.
2. Note the test input used.
3. Retry once after refresh.
4. If still failing, escalate with details for targeted fix.
