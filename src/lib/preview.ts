// Helper function to fetch draft content for preview
export async function getDraftContent(endpoint: string, params?: Record<string, any>) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
    const url = new URL(`/api/${endpoint}`, baseUrl)
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    
    // Add draft status parameter
    url.searchParams.append('status', 'draft')
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error('Failed to fetch draft content:', response.status)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching draft content:', error)
    return null
  }
}

// Check if we're in preview mode
export function isPreviewMode(searchParams: URLSearchParams | any): boolean {
  if (!searchParams || typeof searchParams.get !== 'function') {
    return false
  }
  return searchParams.get('preview') === 'true'
}

// Create preview URL for a given path
export function createPreviewUrl(path: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://katypride.org'
  
  return `${baseUrl}${path}?preview=true`
}
