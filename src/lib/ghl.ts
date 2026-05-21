const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1'

export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || ''

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
        'Version': '2021-04-15',
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
