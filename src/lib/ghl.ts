// GHL v2 API base URL (LeadConnector). The legacy v1 endpoint at
// rest.gohighlevel.com was returning 404 on all calls as of May 2026,
// indicating GHL has sunset v1 for our account. v2 supports the same
// location-level Bearer JWTs but uses different endpoint shapes.
const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || ''

/**
 * Find a contact by email using the v2 /contacts/search endpoint.
 * Replaces the v1 /contacts/lookup endpoint which no longer exists.
 * Returns null on no match or on error so callers can branch to create.
 */
export async function findContactIdByEmail(email: string): Promise<string | null> {
  if (!email) return null
  try {
    const result: any = await ghlRequest('/contacts/search', {
      method: 'POST',
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        pageLimit: 1,
        filters: [{ field: 'email', operator: 'eq', value: email }],
      }),
    })
    return result?.contacts?.[0]?.id || null
  } catch (error) {
    console.warn('[GHL] findContactIdByEmail failed:', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Normalize a contact payload built in our internal shape (customFields as
 * an object map, optional `contactNote` field) into what GHL v2 actually
 * accepts on POST/PUT /contacts/:
 *
 *   - customFields: must be an array of { key, field_value } (v2 rejects
 *     object maps with "customFields must be an array").
 *   - contactNote: not a valid property on /contacts/ in v2. v2 stores notes
 *     at a separate /contacts/{id}/notes resource. This helper strips it
 *     from the returned payload and returns it separately so the caller can
 *     post it via `postContactNote` after the contact write succeeds.
 *
 * Callers should send `payload` to /contacts/ and, if `note` is non-empty,
 * post it via `postContactNote(contactId, note)` afterwards.
 */
export function normalizeContactPayloadForGhl(
  input: Record<string, any>
): { payload: Record<string, any>; note: string | null } {
  const { contactNote, ...rest } = input || {};
  const payload: Record<string, any> = { ...rest };
  if (
    payload.customFields &&
    typeof payload.customFields === 'object' &&
    !Array.isArray(payload.customFields)
  ) {
    const cfObj = payload.customFields as Record<string, any>;
    const cfArray = Object.entries(cfObj)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({ key, field_value: value }));
    if (cfArray.length > 0) {
      payload.customFields = cfArray;
    } else {
      // Empty object would still serialize as {} and trip GHL's array check.
      delete payload.customFields;
    }
  }
  const note =
    typeof contactNote === 'string' && contactNote.trim() ? contactNote : null;
  return { payload, note };
}

/**
 * Attach a note to a contact via GHL v2's separate /contacts/{id}/notes
 * resource. Designed to be non-fatal — callers should swallow errors here
 * since the contact write has already succeeded by the time this runs.
 */
export async function postContactNote(contactId: string, body: string): Promise<void> {
  if (!contactId || !body) return;
  await ghlRequest(`/contacts/${contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      body,
      // v2 requires a userId on notes. The location id is accepted as the
      // system user for integration-authored notes.
      userId: GHL_LOCATION_ID,
    }),
  });
}

export async function ghlRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GHL_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY || ''}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = 'CRM service request failed'
      let responsePreview = ''
      // Tag connectivity-class failures with a stable cause string so
      // src/app/api/crm/route.ts:isCrmConnectivityError can classify
      // without relying on fragile message-string matching.
      let cause: 'CRM_OUTAGE' | undefined
      // Classify by status FIRST so all 5xx (502/503/504, etc.) and the
      // documented 4xx outage shapes get a stable, recognizable message
      // regardless of whether GHL returned a JSON body or HTML/empty.
      // Downstream (src/app/api/crm/route.ts:isCrmConnectivityError) keys
      // off these exact strings to decide whether to gracefully degrade.
      if (response.status >= 500) {
        errorMessage = `CRM request failed (${response.status}): service temporarily unavailable`
        cause = 'CRM_OUTAGE'
      } else {
        switch (response.status) {
          // 401/403 are config errors (bad/expired/revoked API key) that do
          // NOT self-heal. Do NOT tag as CRM_OUTAGE — we want these to surface
          // as a 500 immediately so the first failed submission alerts ops,
          // instead of silently flowing into the deferred-replay queue forever.
          case 401: errorMessage = 'Authentication failed'; break
          case 403: errorMessage = 'Access denied'; break
          case 404: errorMessage = 'Resource not found'; break
          case 429: errorMessage = 'Too many requests'; cause = 'CRM_OUTAGE'; break
        }
      }
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const errorDetails: any = await response.json()
          // For non-5xx and non-mapped statuses, prefer GHL's own message.
          if (response.status < 500 && ![401, 403, 404, 429].includes(response.status)) {
            errorMessage = errorDetails.message || errorDetails.error || 'Request failed'
          }
          responsePreview = JSON.stringify(errorDetails).slice(0, 500)
        } else {
          const text = await response.text()
          responsePreview = text.slice(0, 500)
          if (response.status < 500 && ![401, 403, 404, 429].includes(response.status)) {
            errorMessage = `CRM request failed (${response.status}): ${responsePreview.slice(0, 200)}`
          }
        }
      } catch {
        // If we can't read the body at all, keep the status-derived message above.
      }
      console.error(
        `[GHL] ${options.method || 'GET'} ${endpoint} failed with HTTP ${response.status}. ` +
        `Message: ${errorMessage}. Body preview: ${responsePreview || '(empty)'}`
      )
      const err = new Error(errorMessage) as Error & { crmCause?: 'CRM_OUTAGE'; status?: number; responseBody?: any }
      err.status = response.status
      // Attach the parsed response body so callers can inspect GHL error details
      // (e.g. meta.contactId on "duplicate contacts" 400 responses).
      try { err.responseBody = JSON.parse(responsePreview) } catch { /* non-JSON body, leave undefined */ }
      if (cause) err.crmCause = cause
      throw err
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      const err = new Error('CRM service timeout - request took too long') as Error & { crmCause?: 'CRM_OUTAGE' }
      err.crmCause = 'CRM_OUTAGE'
      throw err
    }
    // Tag fetch-level network failures (DNS, refused, reset, TLS, etc.) as
    // connectivity-class so callers can gracefully degrade.
    if (error instanceof Error && !(error as any).crmCause) {
      const msg = error.message || ''
      if (
        /fetch failed/i.test(msg) ||
        /ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|EPIPE/i.test(msg) ||
        /socket hang up|network error|network request failed/i.test(msg)
      ) {
        ;(error as any).crmCause = 'CRM_OUTAGE'
      }
    }
    throw error
  }
}
