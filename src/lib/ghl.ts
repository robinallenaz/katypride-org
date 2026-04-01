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
      try {
        const errorDetails: any = await response.json()
        switch (response.status) {
          case 401: errorMessage = 'Authentication failed'; break
          case 403: errorMessage = 'Access denied'; break
          case 404: errorMessage = 'Resource not found'; break
          case 429: errorMessage = 'Too many requests'; break
          case 500: errorMessage = 'Service temporarily unavailable'; break
          default:  errorMessage = errorDetails.message || errorDetails.error || 'Request failed'
        }
      } catch {}
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
