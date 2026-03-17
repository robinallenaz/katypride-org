import { strapiClient } from '@/lib/strapi'

export interface CalendarSettings {
  id: number
  documentId: string
  calendarId: string
  timeZone: string
  calendarTitle?: string
  calendarDescription?: string
  showSubscribeButtons?: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export async function getCalendarSettings(): Promise<CalendarSettings | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/calendar-settings`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to improve performance
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error('Failed to fetch calendar settings:', response.status)
      return null
    }

    const data = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error('Failed to fetch calendar settings:', error)
    return null
  }
}
