# GHL Pipeline Integration Reference

## Pipeline: 2026 Vendor/Sponsor Pipeline

### Stage Flow

| Stage | Triggered By | Who/What Handles It |
|-------|-------------|---------------------|
| 1. Registration Form/No Payment | Vendor/sponsor submits form on katypride.org | Website (`/api/crm`) |
| 2. Paid | Stripe payment succeeds | Website (`/api/track-payment` webhook) |
| 3. Contract Sent | Opportunity enters "Paid" stage | GHL workflow (you create) |
| 4. Contract Signed By V/S | Vendor/sponsor e-signs agreement | GHL workflow (existing #4) |
| 5. Fully Executed | Katy Pride countersigns | GHL workflow (existing #5) |

### Website → GHL Data Flow

```
Vendor Signup Page
    ↓
/api/crm (POST)
    - Creates/updates GHL contact
    - Creates opportunity in stage 1 (Registration Form/No Payment)
    - Saves backup to Neon PostgreSQL
    ↓
Stripe Checkout (collects payment)
    ↓
/api/track-payment (Stripe webhook)
    - Updates contact with payment info
    - Moves opportunity to stage 2 (Paid)
```

### Environment Variables

```
GHL_VENDOR_PIPELINE_ID=dQx3L2KuiT3wSfTBV5bv
GHL_LOCATION_ID=Jv1MoTe2L64G9v7k0fxz
```

### GHL Workflow You Need to Create

**Name**: Vendor Agreement - Auto Send on Payment

**Trigger**: Opportunity Stage Changed → Pipeline: 2026 Vendor/Sponsor Pipeline → Stage: Paid

**Actions**:
1. Send Email → Include vendor agreement link
2. Update Opportunity → Stage: Contract Sent

### Sponsor Workflow Gap

`1b - Sponsorship Paid 2026` is draft/empty. Build it out or create a new workflow that mirrors the vendor flow for sponsors.

### Legacy Workflows (Ignore)

- "Vendor" folder (2024 era) — 4 old workflows from Feb/Mar 2024
- "Vendor 2026" folder workflows `1a` and `Registration only` — triggered by old GHL forms, not by website API

### Notes

- Website submits directly to GHL API, NOT to GHL forms
- Old workflows (`1a`, `Registration only`) won't fire for website submissions
- Vendor pricing is server-side in the website code, not in GHL workflows
