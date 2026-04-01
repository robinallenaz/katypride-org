const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || ''

// Validate environment variables at startup
if (process.env.NODE_ENV === 'production' && (!STRAPI_URL || STRAPI_URL === 'http://localhost:1337')) {
  console.error('[STRAPI] CRITICAL: NEXT_PUBLIC_STRAPI_URL is not configured for production')
}

if (process.env.NODE_ENV === 'production' && !STRAPI_API_TOKEN) {
  console.error('[STRAPI] CRITICAL: STRAPI_API_TOKEN is not configured for production')
}

export interface StrapiImage {
  id: number
  name: string
  alternativeText?: string
  caption?: string
  width: number
  height: number
  formats?: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
  url: string
  previewUrl?: string
  provider: string
  provider_metadata?: any
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiFormLink {
  id: number
  documentId: string
  title: string
  url: string
  page: 'celebration' | 'volunteer' | 'vendor' | 'sponsor' | 'contact'
  active: boolean
  orderRank: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiPageContent {
  id: number
  documentId: string
  page: 'celebration' | 'about' | 'advocacy' | 'contact' | 'home'
  heading?: string
  intro?: any // Strapi blocks content
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiResourceLink {
  id: number
  documentId: string
  name: string
  url: string
  category: 'health' | 'advocacy' | 'ally' | 'regional' | 'national'
  active: boolean
  description?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiEvent {
  id: number
  documentId: string
  title: string
  start: string
  end?: string
  location?: string
  summary?: any // Strapi blocks content
  externalUrl?: string
  externalCtaLabel?: string
  image?: StrapiImage
  published: boolean
  eventCategory?: 'general' | 'coffee' | 'social' | 'fundraising' | 'advocacy' | 'education' | 'health' | 'youth' | 'pride' | 'volunteer' | 'cultural' | 'community'
  isRecurring?: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrenceInterval?: number
  recurrenceEndDate?: string
  recurrenceDaysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  recurrenceExceptions?: string // JSON string of exception dates
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiCarouselImage {
  id: number
  documentId: string
  title: string
  image: StrapiImage[]
  alt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

class StrapiClient {
  private baseUrl: string

  constructor(baseUrl: string = STRAPI_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN && { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }),
      ...options.headers,
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Strapi Request: ${url}`)
      console.log(`Token exists: ${!!STRAPI_API_TOKEN}`)
      console.log(`Token length: ${STRAPI_API_TOKEN?.length || 0}`)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        // Enhanced error handling for debugging
        let errorMessage = `Strapi API error: ${response.status} ${response.statusText}`
        
        if (response.status === 403) {
          errorMessage += ' - This usually means the API token is invalid, expired, or missing permissions'
        } else if (response.status === 401) {
          errorMessage += ' - Authentication failed - check API token'
        } else if (response.status === 404) {
          errorMessage += ' - Endpoint not found - check Strapi URL and API routes'
        }
        
        // Try to get more error details
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage += ` - ${errorData.error.message || JSON.stringify(errorData.error)}`
          }
        } catch (e) {
          // If we can't parse error JSON, continue with original error
        }
        
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error('Strapi API request failed:', error)
      
      // If it's a network error or the Strapi server is down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to Strapi at ${this.baseUrl}. Please check if the Strapi server is running and accessible.`)
      }
      
      throw error
    }
  }

  async getEvents(): Promise<StrapiEvent[]> {
    // Use UTC time for consistent filtering regardless of server timezone
    const now = encodeURIComponent(new Date().toISOString())
    const response = await this.request<StrapiResponse<StrapiEvent>>(
      `/events?filters[published][$eq]=true&filters[$or][0][start][$gte]=${now}&filters[$or][1][isRecurring][$eq]=true&filters[$or][1][$or][0][recurrenceEndDate][$null]=true&filters[$or][1][$or][1][recurrenceEndDate][$gte]=${now}&sort=start:asc&populate=image`
    )
    return response.data
  }

  async getResourceLinks(): Promise<StrapiResourceLink[]> {
    const response = await this.request<StrapiResponse<StrapiResourceLink>>(
      `/resource-links?filters[active][$eq]=true&sort=orderRank:asc`
    )
    return response.data
  }

  async getFormLinks(page: string): Promise<StrapiFormLink[]> {
    const response = await this.request<StrapiResponse<StrapiFormLink>>(
      `/form-links?filters[page][$eq]=${page}&filters[active][$eq]=true&sort=orderRank:asc`
    )
    return response.data
  }

  async getPageContent(page: string): Promise<StrapiPageContent | null> {
    const response = await this.request<StrapiResponse<StrapiPageContent>>(
      `/page-contents?filters[page][$eq]=${page}&filters[published][$eq]=true`
    )
    return response.data[0] || null
  }

  getImageUrl(image: StrapiImage): string {
    if (image.url.startsWith('http')) {
      return image.url
    }
    if (image.provider === 'hardcoded') {
      return image.url
    }
    // Remove leading slash from image.url to prevent double slashes
    const cleanImageUrl = image.url.startsWith('/') ? image.url.slice(1) : image.url
    // Remove trailing slash from baseUrl to prevent double slashes
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    return `${cleanBaseUrl}/${cleanImageUrl}`
  }

  getImageUrlWithSize(image: StrapiImage, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
    if (image.formats && image.formats[size]) {
      const format = image.formats[size]
      if (format.url.startsWith('http')) {
        return format.url
      }
      if (image.provider === 'hardcoded') {
        return format.url
      }
      // Remove leading slash from format.url to prevent double slashes
      const cleanFormatUrl = format.url.startsWith('/') ? format.url.slice(1) : format.url
      // Remove trailing slash from baseUrl to prevent double slashes
      const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
      return `${cleanBaseUrl}/${cleanFormatUrl}`
    }
    return this.getImageUrl(image)
  }
}

export const strapiClient = new StrapiClient()
