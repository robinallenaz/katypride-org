/**
 * GHL form submission helper.
 *
 * Used to programmatically submit data to a GHL-hosted form so that GHL
 * workflows triggered by "Form Submitted" can fire from server-side code.
 *
 * In our case: after Stripe confirms a vendor payment, /api/track-payment
 * submits to the GHL "2025 Vendor Form" via this helper. That triggers
 * workflow "1a - Vendor Payment 2026" which creates the pipeline opp,
 * sends the Vendor Agreement, and advances the stage to Contract Sent.
 *
 * GHL exposes form submissions via the public widget endpoint:
 *   POST https://services.leadconnectorhq.com/widget/form/{formId}
 *
 * The body is multipart form-data with `formId`, `locationId`, and a
 * `formData` field containing a JSON string of the field values. This
 * mirrors what the embedded iframe does in the browser. No auth needed
 * because GHL forms are public by design.
 */

const GHL_FORM_BASE_URL = 'https://services.leadconnectorhq.com/widget/form';

export interface GhlFormSubmitResult {
  ok: boolean;
  status: number;
  body?: any;
  error?: string;
}

/**
 * Submit a payload to a GHL form. Field keys must match the form's
 * configured field names (visible in the form's HTML embed code as
 * `name=` attributes on each input).
 */
export async function submitGhlForm(
  formId: string,
  fields: Record<string, string | number | boolean | undefined | null>,
  locationId: string
): Promise<GhlFormSubmitResult> {
  if (!formId) {
    return { ok: false, status: 0, error: 'Missing formId' };
  }
  if (!locationId) {
    return { ok: false, status: 0, error: 'Missing locationId' };
  }

  // Strip undefined/null/empty values; coerce to strings
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '') continue;
    cleaned[k] = String(v);
  }

  const formData = new FormData();
  formData.append('formId', formId);
  formData.append('locationId', locationId);
  formData.append('formData', JSON.stringify(cleaned));
  formData.append(
    'eventData',
    JSON.stringify({
      source: 'katypride.org website',
      type: 'page-visit',
      parentId: 'integration-katypride-org',
    })
  );

  const url = `${GHL_FORM_BASE_URL}/${encodeURIComponent(formId)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // Not JSON; ignore
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        body,
        error: `GHL form submit failed: ${response.status}`,
      };
    }

    return { ok: true, status: response.status, body };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
