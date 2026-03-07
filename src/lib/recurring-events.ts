import { type StrapiEvent } from './strapi'

export interface GeneratedEvent {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  summary?: any
  externalUrl?: string
  externalCtaLabel?: string
  image?: any
  published: boolean
  eventCategory?: 'general' | 'coffee' | 'social' | 'fundraising' | 'advocacy' | 'education' | 'health' | 'youth' | 'pride' | 'volunteer' | 'cultural' | 'community'
  isRecurring: boolean
  parentId: string
  originalEvent: StrapiEvent
}

/**
 * Generates recurring event instances from a base event
 */
export function generateRecurringEvents(event: StrapiEvent): GeneratedEvent[] {
  if (!event.isRecurring || !event.recurrencePattern) {
    return []
  }

  const instances: GeneratedEvent[] = []
  const startDate = new Date(event.start)
  const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : null
  const exceptions = event.recurrenceExceptions ? JSON.parse(event.recurrenceExceptions) : []
  
  // Convert exception dates to Date objects for comparison
  const exceptionDates = exceptions.map((dateStr: string) => {
    const date = new Date(dateStr)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()) // Normalize to start of day
  })

  let currentDate = new Date(startDate)
  const maxInstances = 100 // Safety limit to prevent infinite loops
  let instanceCount = 0

  while (
    instanceCount < maxInstances &&
    (!endDate || currentDate <= endDate) &&
    currentDate <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Limit to 1 year from now
  ) {
    // Check if this date is an exception
    const currentDateNormalized = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    if (!exceptionDates.some((exceptionDate: Date) => exceptionDate.getTime() === currentDateNormalized.getTime())) {
      // Generate event instance
      const instance: GeneratedEvent = {
        id: `${event.documentId}-${currentDate.getTime()}`,
        title: event.title,
        start: new Date(currentDate),
        end: event.end ? calculateEndTime(currentDate, new Date(event.end), startDate) : undefined,
        location: event.location,
        summary: event.summary,
        externalUrl: event.externalUrl,
        externalCtaLabel: event.externalCtaLabel,
        image: event.image,
        published: event.published,
        eventCategory: event.eventCategory,
        isRecurring: true,
        parentId: event.documentId,
        originalEvent: event
      }
      instances.push(instance)
      instanceCount++
    }

    // Move to next occurrence based on pattern
    currentDate = getNextOccurrence(currentDate, event.recurrencePattern, event.recurrenceInterval || 1, event.recurrenceDaysOfWeek)
  }

  return instances
}

/**
 * Calculates the end time for a recurring event instance
 */
function calculateEndTime(currentStart: Date, originalEnd: Date, originalStart: Date): Date {
  const duration = originalEnd.getTime() - originalStart.getTime()
  return new Date(currentStart.getTime() + duration)
}

/**
 * Calculates the next occurrence date based on recurrence pattern
 */
function getNextOccurrence(
  currentDate: Date,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  daysOfWeek?: number[]
): Date {
  const nextDate = new Date(currentDate)

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval)
      break

    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find the next occurrence based on specific days of week
        let nextDayFound = false
        let attempts = 0
        const maxAttempts = 7 * interval // Prevent infinite loops

        while (!nextDayFound && attempts < maxAttempts) {
          nextDate.setDate(nextDate.getDate() + 1)
          const dayOfWeek = nextDate.getDay()
          
          if (daysOfWeek.includes(dayOfWeek)) {
            nextDayFound = true
          }
          attempts++
        }
      } else {
        // Simple weekly recurrence (same day of week)
        nextDate.setDate(nextDate.getDate() + (7 * interval))
      }
      break

    case 'monthly':
      const originalDay = currentDate.getDate()
      nextDate.setMonth(nextDate.getMonth() + interval)
      // Handle cases where the day might not exist (e.g., 31st to February)
      // Set to last day of target month if the original day doesn't exist
      if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(0) // Set to last day of target month
      }
      break

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval)
      break

    default:
      nextDate.setDate(nextDate.getDate() + interval)
  }

  return nextDate
}

/**
 * Processes an array of events and generates recurring instances
 */
export function processEventsWithRecurrences(events: StrapiEvent[]): GeneratedEvent[] {
  const processedEvents: GeneratedEvent[] = []

  for (const event of events) {
    // Add the original event as a non-recurring instance
    processedEvents.push({
      id: event.documentId,
      title: event.title,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : undefined,
      location: event.location,
      summary: event.summary,
      externalUrl: event.externalUrl,
      externalCtaLabel: event.externalCtaLabel,
      image: event.image,
      published: event.published,
      eventCategory: event.eventCategory,
      isRecurring: false,
      parentId: event.documentId,
      originalEvent: event
    })

    // Add recurring instances if applicable
    if (event.isRecurring) {
      const recurringInstances = generateRecurringEvents(event)
      processedEvents.push(...recurringInstances)
    }
  }

  return processedEvents
}
