import { client } from '@/sanity/lib/client'

// Helper function to fetch draft content for preview
export async function getDraftContent(query: string, params?: Record<string, any>) {
  return client.fetch(query, params, {
    // Include draft documents
    perspective: 'previewDrafts',
  })
}

// Check if we're in preview mode
export function isPreviewMode(searchParams: URLSearchParams | Record<string, string> | any): boolean {
  if (!searchParams) {
    return false
  }
  
  // Handle Next.js searchParams (plain object)
  if (typeof searchParams === 'object' && 'preview' in searchParams) {
    return searchParams.preview === 'true'
  }
  
  // Handle URLSearchParams object
  if (typeof searchParams.get === 'function') {
    return searchParams.get('preview') === 'true'
  }
  
  return false
}

// Create preview URL for a given path
export function createPreviewUrl(path: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://katypride.org'
  
  return `${baseUrl}${path}?preview=true`
}
