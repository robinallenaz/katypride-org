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
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const errorDetails: any = await response.json()
          switch (response.status) {
            case 401: errorMessage = 'Authentication failed'; break
            case 403: errorMessage = 'Access denied'; break
            case 404: errorMessage = 'Resource not found'; break
            case 429: errorMessage = 'Too many requests'; break
            case 500: errorMessage = 'Service temporarily unavailable'; break
            default:  errorMessage = errorDetails.message || errorDetails.error || 'Request failed'
          }
          responsePreview = JSON.stringify(errorDetails).slice(0, 500)
        } else {
          const text = await response.text()
          responsePreview = text.slice(0, 500)
          errorMessage = `CRM request failed (${response.status}): ${responsePreview.slice(0, 200)}`
        }
      } catch {
        // If we can't read the body at all, keep the generic message but log status
      }
      console.error(
        `[GHL] ${options.method || 'GET'} ${endpoint} failed with HTTP ${response.status}. ` +
        `Message: ${errorMessage}. Body preview: ${responsePreview || '(empty)'}`
      )
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('CRM service timeout - request took too long')
    }
    throw error
  }
}
