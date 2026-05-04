import { readData, type Event } from '@/lib/data-service'
import EventsList, { type EventItem } from './EventsList'
import type { CoffeeMeetupConfig } from '@/lib/coffee-meetup-config'

// Read coffee meetup config via the shared data service so admin edits
// (written through /api/admin/coffee-meetup) are picked up automatically.
async function getCoffeeMeetupConfig(): Promise<CoffeeMeetupConfig | null> {
  try {
    const config = await readData<CoffeeMeetupConfig>('coffee-meetup-config')
    if (!config || typeof config !== 'object') return null
    return config
  } catch (error) {
    console.error('Failed to load coffee meetup config:', error)
    return null
  }
}

// Parse a YYYY-MM-DD string as a local-time Date at midnight.
// Avoids the UTC drift you get from `new Date("YYYY-MM-DD")` in negative timezones.
function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  if (!match) {
    const fallback = new Date(dateStr)
    return isNaN(fallback.getTime()) ? null : fallback
  }
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}

// Helper function to get 2nd Friday of current/upcoming month
function getSecondFridayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1)
  let firstFriday = 1
  while (firstDay.getDay() !== 5) {
    firstFriday++
    firstDay.setDate(firstFriday)
  }
  const secondFriday = firstFriday + 7
  return new Date(year, month, secondFriday)
}

function getSecondFridayDate(skipMonths: number[] = []): Date | null {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Try current month first, then up to 12 months ahead
  for (let i = 0; i < 12; i++) {
    const targetMonth = currentMonth + i
    const targetYear = currentYear + Math.floor(targetMonth / 12)
    const normalizedMonth = targetMonth % 12

    // Skip if month is in skip list
    if (skipMonths.includes(normalizedMonth + 1)) continue

    const targetDate = getSecondFridayOfMonth(targetYear, normalizedMonth)

    // Return first 2nd Friday that hasn't passed yet (date-only comparison
    // so the meetup still appears on the day of the event)
    if (targetDate >= todayMidnight) {
      return targetDate
    }
  }

  return null
}

// Parse time string (HH:MM) to hours and minutes.
// Falls back to 13:00 if input is malformed so a corrupt config never produces
// an Invalid Date when passed to setHours().
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeStr || '')
  if (!match) {
    console.warn(`[CoffeeMeetup] Invalid time string "${timeStr}", falling back to 13:00`)
    return { hours: 13, minutes: 0 }
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) }
}

// Create coffee meetup event from config
async function createCoffeeMeetupFromConfig(): Promise<EventItem | null> {
  const config = await getCoffeeMeetupConfig()

  if (!config || !config.enabled) {
    return null
  }

  let targetDate: Date | null = null
  let specificEvent = null

  // Check for manual override with specific dates
  if (config.manualOverride && config.specificDates.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort by date ascending so we always pick the soonest upcoming meetup.
    // Parse as local-time to avoid UTC midnight shifting the date a day earlier
    // for users in negative timezones (e.g. US Central).
    const sortedDates = [...config.specificDates]
      .map((event) => ({ event, parsed: parseLocalDate(event.date) }))
      .filter((entry): entry is { event: typeof entry.event; parsed: Date } => entry.parsed !== null)
      .sort((a, b) => a.parsed.getTime() - b.parsed.getTime())

    // Find first specific date that hasn't passed
    for (const { event, parsed } of sortedDates) {
      if (parsed >= today) {
        targetDate = new Date(parsed)
        specificEvent = event
        break
      }
    }
  }

  // If no specific date found, use auto-calculated 2nd Friday
  if (!targetDate) {
    targetDate = getSecondFridayDate(config.skipMonths)
  }

  if (!targetDate) {
    return null
  }

  // Set time — build an ISO string with explicit -05:00 offset so the
  // Date represents the correct Central Time regardless of server timezone.
  const timeStr = specificEvent?.timeOverride || config.defaultTime
  const { hours, minutes } = parseTime(timeStr)
  const yyyy = targetDate.getFullYear()
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
  const dd = String(targetDate.getDate()).padStart(2, '0')
  const hh = String(hours).padStart(2, '0')
  const min = String(minutes).padStart(2, '0')
  targetDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00-05:00`)

  // Calculate end date
  const endDate = new Date(targetDate.getTime() + config.defaultDuration * 60 * 60 * 1000)

  const resolvedLocation = specificEvent?.location || config.defaultLocation
  // Build directions URL dynamically so location overrides work correctly
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resolvedLocation)}`

  return {
    id: 'coffee-meetup-static',
    title: specificEvent?.title || config.title,
    start: targetDate,
    end: endDate,
    location: resolvedLocation,
    imageSrc: config.image,
    imageAlt: config.title,
    eventCategory: 'coffee',
    externalUrl: directionsUrl,
    externalCtaLabel: 'Get Directions',
    summary: config.description,
  }
}

// Convert Event to EventItem
function convertToEventItem(event: Event): EventItem {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: event.end ? new Date(event.end) : undefined,
    location: event.location,
    imageSrc: event.imageSrc,
    imageAlt: event.imageAlt,
    eventCategory: event.eventCategory,
    externalUrl: event.externalUrl,
    externalCtaLabel: event.externalCtaLabel,
    summary: event.summary,
    isRecurring: event.isRecurring,
    parentId: event.parentId,
  }
}

// Server-side data fetching with caching
async function getEvents(): Promise<{ events: EventItem[]; error?: string | null }> {
  try {
    const data = await readData<{ events: Event[] }>('events')
    
    // Use date-only "today" so events still show on their event day even after
    // the start time has passed (matches the coffee meetup date-only logic).
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const eventItems: EventItem[] = data.events
      .filter(event => new Date(event.start) >= todayMidnight) // Only events today or later
      .map(convertToEventItem)

    // Add coffee meetup from config ONLY if no coffee event already exists on that date
    const coffeeMeetup = await createCoffeeMeetupFromConfig()
    const hasCoffeeOnFriday = coffeeMeetup ? eventItems.some(event => {
      // Check if there's a coffee category event on the same date
      const eventDate = new Date(event.start)
      const sameDay = eventDate.toDateString() === coffeeMeetup.start.toDateString()
      const isCoffeeCategory = event.eventCategory === 'coffee'
      return sameDay && isCoffeeCategory
    }) : false
    
    if (!hasCoffeeOnFriday && coffeeMeetup) {
      eventItems.push(coffeeMeetup)
    }

    // Sort by date
    eventItems.sort((a, b) => a.start.getTime() - b.start.getTime())

    return { events: eventItems, error: null }
  } catch (error) {
    console.error('Failed to fetch events:', error)
    // Return empty array or try to get coffee meetup as fallback
    const fallbackCoffee = await createCoffeeMeetupFromConfig()
    return { events: fallbackCoffee ? [fallbackCoffee] : [], error: 'Failed to load events' }
  }
}

// Disable caching to ensure fresh data from filesystem
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const { events, error } = await getEvents()

  return <EventsList initialEvents={events} error={error} />
}
