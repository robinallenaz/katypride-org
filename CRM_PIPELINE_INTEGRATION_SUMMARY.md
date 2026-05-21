# CRM Pipeline Integration Summary

## Context
This is a Next.js 16 application deployed on Vercel for Katy Pride, a non-profit LGBTQ+ organization in Katy, TX. The CRM is GrowthSphere360 (a GoHighLevel white-label). The system handles volunteer, donor, vendor, sponsor, and community-member registrations.

**Key stakeholders:** Kristina (GHL admin who configures workflows), the user (technical lead), and board members who review vendor/sponsor applications.

---

## Architecture Overview

The integration uses a **dual-path strategy** for moving contacts through the GHL pipeline:

1. **Vendors**: Triggered by Stripe webhook → submits to GHL form → GHL workflow creates opportunity + sends agreement automatically.
2. **Sponsors**: Created directly via API on form submission + moved via API on payment (manual agreement until workflow 1b is built).
3. **Donors/Volunteers/Community**: Only contact creation, no pipeline involvement.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/crm/route.ts` | Main form submission handler. Creates/updates GHL contacts, builds tags, writes CRM notes. For sponsors, creates pipeline opportunity in "Registration Form/No Payment". For vendors, does NOT create opportunity (workflow 1a handles it). |
| `src/app/api/track-payment/route.ts` | Stripe webhook handler for `payment_intent.succeeded` and `checkout.session.completed`. Updates contact with payment tags, triggers GHL form submission for vendors, moves sponsor opportunities to Paid stage. |
| `src/app/api/create-payment-intent/route.ts` | Creates Stripe PaymentIntent with server-side vendor/sponsor pricing validation. Rejects tampered amounts or invalid promo codes. |
| `src/app/api/verify-payment-intent/route.ts` | Verifies payment succeeded, validates amount matches server-defined pricing, prevents replay attacks. |
| `src/lib/ghl-pipeline.ts` | API wrappers: `getVendorPipeline()`, `getStageIdByName()`, `findOpportunityByContactAndPipeline()`, `createOpportunity()`, `updateOpportunityStage()`. |
| `src/lib/ghl-forms.ts` | `submitGhlForm()` — submits data to public GHL form widget endpoint (LeadForge domain). Used by webhook to trigger workflow 1a. |
| `src/lib/ghl.ts` | Base `ghlRequest()` helper with auth headers and error handling. |
| `src/components/VendorSignupForm.tsx` | Client-side vendor form with Stripe CardElement integration, promo code logic (LOYAL50, TEST1), CRM submission, payment confirmation. |

---

## Vendor Flow (Automated Agreement Path)

```
User fills VendorSignupForm
    ↓
POST /api/crm
    • Creates/updates GHL contact
    • Tags: [vendor, vendor-{type}, loyalty-vendor (if applicable)]
    • Contact note includes vendor type, products/services, fee
    • NO opportunity created here (intentional — avoids duplicates)
    ↓
Stripe PaymentIntent confirmation (client-side)
    ↓
Stripe webhook → POST /api/track-payment
    • Verifies signature + idempotency (Redis or in-memory fallback)
    • Updates contact: tags [vendor, paid], payment metadata
    • Calls submitGhlForm(GHL_VENDOR_FORM_ID, { ...fields })
    • Form submission triggers GHL workflow "1a - Vendor Payment 2026"
    • Workflow 1a: creates opp in "Paid" stage → sends Vendor Agreement → advances to "Contract Sent"
    • Sponsor branch: moves existing opp to "Paid" manually (workflow 1b is draft)
```

### Critical Implementation Detail

The `submitGhlForm()` function in `src/lib/ghl-forms.ts` POSTs to the **public widget endpoint**:
```
POST https://link.leadforge.agency/widget/form/{formId}
```
with `formData` as a JSON string in multipart form-data. This is the same mechanism the embedded iframe uses. **No auth token is needed** because GHL forms are public by design.

**Form field names MUST match the GHL form's query keys exactly.** Verified field map (2026-05-12) in `track-payment`:

```typescript
{
  first_name: (name || '').split(' ')[0] || '',
  last_name: (name || '').split(' ').slice(1).join(' ') || '',
  email,
  phone: (paymentIntent as any).charges?.data?.[0]?.billing_details?.phone || '',
  organization: company || '',
  vendor_type: vendorTypeMap[metadata.vendorType || ''] || '',
}
```

The `vendorTypeMap` converts internal codes to GHL option labels:
- `nonprofit` → `"Non-Profit - $225"`
- `forprofit` → `"For-Profit - $275"`
- `food` → `"Food Vendor - $325"`
- `political` → `"Political Campaign - $225"`
- `government` → `"Government Entity - $225"`

Only fields present in the payload are sent; `submitGhlForm` strips empty values. Missing fields (address, city, products/services, etc.) are omitted. The contact already exists in GHL from `/api/crm`, so the form submission updates the contact and triggers workflow 1a.

---

## Sponsor Flow (Manual Agreement Path)

```
User fills sponsor form (same component, different type)
    ↓
POST /api/crm
    • Creates/updates GHL contact
    • Tags: [sponsor, sponsor-{level}, event-{event}]
    • Creates pipeline opportunity in "Registration Form/No Payment" stage
    • Contact note includes sponsorship level, organization details
    ↓
Stripe PaymentIntent confirmation
    ↓
Stripe webhook → POST /api/track-payment
    • Updates contact: tags [sponsor, paid], payment metadata
    • Finds existing opportunity for contact + pipeline
    • Moves opportunity to "Paid" stage via updateOpportunityStage()
    • Does NOT submit to GHL form (GHL_SPONSOR_FORM_ID is empty, workflow 1b is draft)
    • Agreement must be sent manually from GHL until workflow 1b is built
```

---

## Environment Variables Required

| Variable | Used By | Description |
|----------|---------|-------------|
| `GHL_API_KEY` | `ghlRequest` | GoHighLevel API key |
| `GHL_LOCATION_ID` | All GHL calls | Location ID for GrowthSphere360 |
| `GHL_VENDOR_PIPELINE_ID` | `ghl-pipeline.ts` | Pipeline ID for vendor/sponsor tracking |
| `GHL_VENDOR_FORM_ID` | `track-payment.ts` | Form ID for "2025 Vendor Form" (workflow 1a trigger). Default: `ANHnhavGydDuPa4wvvSq` |
| `GHL_SPONSOR_FORM_ID` | `track-payment.ts` | Form ID for "Sponsorship Form" (workflow 1b trigger). Currently empty/optional |
| `GHL_FORM_WIDGET_BASE_URL` | `ghl-forms.ts` | Base URL for form widget. Default: `https://link.leadforge.agency/widget/form` |
| `STRIPE_SECRET_KEY` | `create-payment-intent.ts`, `track-payment.ts` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `track-payment.ts` | Webhook signing secret |
| `STRIPE_ENABLED` | `create-payment-intent.ts` | Kill switch. Set to `false` to disable payments |
| `UPSTASH_REDIS_REST_URL` | `track-payment.ts` | Optional — Redis for cross-instance idempotency |
| `UPSTASH_REDIS_REST_TOKEN` | `track-payment.ts` | Optional — Redis auth token |

---

## Pricing Constants (Server-Side Authoritative)

### Vendor Fees
All three locations must stay in sync:

```typescript
// src/components/VendorSignupForm.tsx
// src/app/api/create-payment-intent/route.ts
// src/app/api/verify-payment-intent/route.ts
// src/app/api/crm/route.ts
const VENDOR_PRICES = {
  nonprofit:  { price: 225, loyaltyEligible: true  },
  forprofit:  { price: 275, loyaltyEligible: true  },
  food:       { price: 300, loyaltyEligible: false },
  political:  { price: 275, loyaltyEligible: false },
  government: { price: 275, loyaltyEligible: false },
};
```

### Promo Codes
- **LOYAL50**: $50 off, eligible for `nonprofit` and `forprofit` only, valid May 1-31, 2026
- **TEST1**: 99% off any vendor type, for internal testing

Server-side validation in `create-payment-intent/route.ts` rejects mismatched amounts or invalid promo codes to prevent tampering.

---

## Known Gaps & Risks

### 1. GHL Form Price Mismatch (HIGH RISK)
The GHL form shows different prices than the code for Food ($325 vs $300) and Political/Government ($225 vs $275). The `vendorTypeMap` currently sends the GHL label values as-is, which includes these mismatched prices. If a vendor selects "Food Vendor - $325" in GHL but paid $300 in Stripe, reporting will be inconsistent.

**Fix needed:** Update the GHL form option values to match: Food → $300, Political → $275, Government → $275. Also update the `vendorTypeMap` in `track-payment.ts` to send the corrected labels.

### 2. Sponsor Automation Missing (MEDIUM RISK)
Workflow "1b - Sponsorship Paid 2026" is currently empty/draft. Sponsors do NOT get automatic agreement sending. The pipeline opportunity moves to "Paid" but Kristina must send the agreement manually.

### 3. LeadForge Domain Assumption (MEDIUM RISK)
`GHL_FORM_BASE_URL` defaults to `https://link.leadforge.agency/widget/form`. If the white-label domain changed or differs by environment, form submissions will fail silently.

### 4. No Alert on GHL Form Submission Failure (MEDIUM RISK)
If `submitGhlForm()` fails (wrong fields, network timeout, wrong domain), the error is only logged to console. No email alert, no retry mechanism, no dead-letter queue. The vendor is marked `paid` in the CRM but may never receive an agreement.

### 5. Pipeline Stage Name Fragility (LOW RISK)
Stage lookups use exact string matching: `"Registration Form/No Payment"`, `"Paid"`. If Kristina renames these stages in GHL, the code will silently fail.

### 6. checkout.session.completed Returns 500 on GHL Errors (LOW RISK)
Unlike the main `payment_intent.succeeded` branch which now swallows unexpected errors to return 200, the `checkout.session.completed` branch still returns 500 on GHL failures. Stripe will retry repeatedly.

---

## Testing Strategy

1. **Stripe webhook test**: Use `scripts/test-webhook.mjs` with `STRIPE_WEBHOOK_SECRET` env var to send fake events.
2. **GHL form field audit**: Manually inspect the embed code for "2025 Vendor Form" and compare field names.
3. **End-to-end test**: Submit a real vendor signup with test card (Stripe test mode), verify:
   - Contact created in GHL
   - Payment confirmed in Stripe
   - Pipeline opportunity created in "Paid" stage
   - Vendor Agreement sent (check GHL workflow execution log)
4. **Promo code validation**: Try applying LOYAL50 to a food vendor — server should reject.
5. **Amount tampering test**: Intercept the PaymentIntent creation request and change the amount — server should reject with `400`.

---

## Quick Reference for Another LLM

**If you need to modify vendor pricing:** Update `VENDOR_PRICES` in ALL three files: `VendorSignupForm.tsx`, `create-payment-intent/route.ts`, `crm/route.ts`.

**If you need to add a new vendor type:** Add to `ALLOWED_VENDOR_TYPES` in `crm/route.ts`, add pricing in all three files, update `vendorTypes` array in `VendorSignupForm.tsx`, add to `vendorBaseAmounts` in `verify-payment-intent/route.ts`.

**If you need to change pipeline stage names:** Update the string literals in `crm/route.ts` and `track-payment/route.ts`. Also verify the stage names exist in GHL.

**If workflow 1a isn't firing:** Check (1) form field names match, (2) `GHL_VENDOR_FORM_ID` is correct, (3) workflow is active in GHL (not paused/draft), (4) LeadForge URL is reachable.

**If sponsors need automatic agreements:** Build workflow 1b in GHL, set `GHL_SPONSOR_FORM_ID`, and update `track-payment.ts` to submit to that form (mirror the vendor logic in the sponsor branch).
