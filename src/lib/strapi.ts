const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || ''

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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Strapi API request failed:', error)
      throw error
    }
  }

  async getEvents(): Promise<StrapiEvent[]> {
    // Use UTC time for consistent filtering regardless of server timezone
    const now = encodeURIComponent(new Date().toISOString())
    const response = await this.request<StrapiResponse<StrapiEvent>>(
      `/events?filters[published][$eq]=true&filters[start][$gte]=${now}&sort=start:asc&populate=image`
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
