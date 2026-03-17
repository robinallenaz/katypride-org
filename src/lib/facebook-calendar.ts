import { strapiClient } from '@/lib/strapi'

export interface FacebookEvent {
  id: string
  name: string
  description: string
  start_time: string
  end_time?: string
  place?: {
    name: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    latitude?: number
    longitude?: number
  }
  cover?: {
    source: string
    offset_x?: number
    offset_y?: number
  }
  is_online?: boolean
  event_times?: Array<{
    start_time: string
    end_time?: string
    id: string
  }>
}

export interface FacebookCalendarSettings {
  id: number
  documentId: string
  pageId: string
  pageName?: string
  calendarTitle?: string
  calendarDescription?: string
  showSubscribeButtons?: boolean
  maxEvents?: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export async function getFacebookCalendarSettings(): Promise<FacebookCalendarSettings | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/facebook-calendar-settings`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to improve performance
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error('Failed to fetch Facebook calendar settings:', response.status)
      return null
    }

    const data = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error('Failed to fetch Facebook calendar settings:', error)
    return null
  }
}

export async function getFacebookEvents(pageId: string, maxEvents: number = 10): Promise<FacebookEvent[]> {
  try {
    // Note: This requires a Facebook Page Access Token
    // You'll need to set up Facebook Graph API access
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    
    if (!accessToken) {
      console.warn('Facebook Page Access Token not configured')
      return []
    }

    const baseUrl = 'https://graph.facebook.com/v18.0'
    const fields = [
      'id',
      'name',
      'description',
      'start_time',
      'end_time',
      'place',
      'cover',
      'is_online',
      'event_times'
    ].join(',')

    const url = `${baseUrl}/${pageId}/events?fields=${fields}&limit=${maxEvents}&access_token=${accessToken}&time_filter=upcoming`

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Facebook events:', response.status)
      return []
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('Facebook API error:', data.error)
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Failed to fetch Facebook events:', error)
    return []
  }
}

export function formatFacebookEvent(event: FacebookEvent) {
  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null
  
  // Format date and time
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  // Format location
  let location = event.place?.name || 'Online Event'
  if (event.place?.address) {
    location = `${event.place.name}, ${event.place.address}`
    if (event.place?.city) location += `, ${event.place.city}`
    if (event.place?.state) location += `, ${event.place.state}`
  }

  return {
    ...event,
    formattedDate,
    formattedTime,
    formattedLocation: location,
    isUpcoming: startDate > new Date()
  }
}

export function getFacebookEventUrl(eventId: string, pageId?: string) {
  return `https://www.facebook.com/events/${eventId}`
}

export function getFacebookPageUrl(pageId: string) {
  return `https://www.facebook.com/${pageId}`
}
