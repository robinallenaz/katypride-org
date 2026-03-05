import { client } from '@/sanity/lib/client'

export interface CalendarSettings {
  _id: string
  calendarId: string
  timeZone: string
  calendarTitle?: string
  calendarDescription?: string
  showSubscribeButtons?: boolean
}

export async function getCalendarSettings(): Promise<CalendarSettings | null> {
  const query = `
    *[_type == "calendarSettings"][0] {
      _id,
      calendarId,
      timeZone,
      calendarTitle,
      calendarDescription,
      showSubscribeButtons
    }
  `
  
  try {
    return await client.fetch(query, {}, { cache: 'no-store' })
  } catch (error) {
    console.error('Failed to fetch calendar settings:', error)
    return null
  }
}
