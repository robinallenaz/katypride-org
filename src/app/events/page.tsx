import { readData, type Event } from '@/lib/data-service'
import EventsList, { type EventItem } from './EventsList'
import { promises as fs } from 'fs'
import path from 'path'

// Coffee Meetup Config Types
interface CoffeeMeetupConfig {
  enabled: boolean
  manualOverride: boolean
  specificDates: Array<{
    date: string
    title?: string
    location?: string
    timeOverride?: string | null
    notes?: string
  }>
  skipMonths: number[]
  defaultTime: string
  defaultDuration: number
  defaultLocation: string
  title: string
  description: string
  image: string
}

// Read coffee meetup config from JSON file
async function getCoffeeMeetupConfig(): Promise<CoffeeMeetupConfig | null> {
  try {
    const configPath = path.join(process.cwd(), 'content', 'coffee-meetups.json')
    const configData = await fs.readFile(configPath, 'utf-8')
    return JSON.parse(configData)
  } catch (error) {
    console.error('Failed to load coffee meetup config:', error)
    return null
  }
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
  let currentMonth = today.getMonth()
  let currentYear = today.getFullYear()

  // Try current month first, then up to 12 months ahead
  for (let i = 0; i < 12; i++) {
    const targetMonth = currentMonth + i
    const targetYear = currentYear + Math.floor(targetMonth / 12)
    const normalizedMonth = targetMonth % 12

    // Skip if month is in skip list
    if (skipMonths.includes(normalizedMonth + 1)) continue

    const targetDate = getSecondFridayOfMonth(targetYear, normalizedMonth)

    // Return first 2nd Friday that hasn't passed yet
    if (targetDate >= today) {
      return targetDate
    }
  }

  return null
}

// Parse time string (HH:MM) to hours and minutes
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
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

    // Find first specific date that hasn't passed
    for (const event of config.specificDates) {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)

      if (eventDate >= today) {
        targetDate = new Date(event.date)
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

  // Set time
  const timeStr = specificEvent?.timeOverride || config.defaultTime
  const { hours, minutes } = parseTime(timeStr)
  targetDate.setHours(hours, minutes, 0, 0)

  // Calculate end date
  const endDate = new Date(targetDate.getTime() + config.defaultDuration * 60 * 60 * 1000)

  return {
    id: 'coffee-meetup-static',
    title: specificEvent?.title || config.title,
    start: targetDate,
    end: endDate,
    location: specificEvent?.location || config.defaultLocation,
    imageSrc: config.image,
    imageAlt: config.title,
    eventCategory: 'coffee',
    externalUrl: 'https://www.google.com/maps/dir//3329%20W%20Grand%20Pkwy%20N%20%23700,%20Katy,%20TX%2077449',
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
    
    const eventItems: EventItem[] = data.events
      .filter(event => new Date(event.start) >= new Date()) // Only future events
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
