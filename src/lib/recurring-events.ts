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
  const originalEndDate = event.end ? new Date(event.end) : null
  const now = new Date()
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  const safeInterval = Math.max(1, event.recurrenceInterval || 1)
  const monthlyOccurrenceIndex =
    event.recurrencePattern === 'monthly' && event.recurrenceDaysOfWeek && event.recurrenceDaysOfWeek.length > 0
      ? Math.ceil(startDate.getDate() / 7)
      : undefined
  const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : null
  const exceptions = parseRecurrenceExceptions(event.recurrenceExceptions)
  
  // Convert exception dates to Date objects for comparison
  const exceptionDates = exceptions.map((dateStr: string) => {
    const date = new Date(dateStr)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()) // Normalize to start of day
  })

  let currentDate = new Date(startDate)
  const maxInstances = 100 // Max future-facing instances to render
  const maxIterations = 10000 // Safety limit to prevent infinite loops
  let emittedCount = 0
  let iterationCount = 0

  // Move old recurring series to the current horizon before emitting so
  // long-running events don't spend all iterations traversing historical dates.
  const fastForwardResult = fastForwardToNow(
    currentDate,
    originalEndDate,
    now,
    event.recurrencePattern,
    safeInterval,
    event.recurrenceDaysOfWeek,
    startDate,
    monthlyOccurrenceIndex,
    exceptions,
    maxIterations
  )
  currentDate = fastForwardResult.date
  let fastForwardIterations = fastForwardResult.iterations

  while (
    emittedCount < maxInstances &&
    fastForwardIterations + iterationCount < maxIterations &&
    (!endDate || currentDate <= endDate) &&
    currentDate <= oneYearFromNow
  ) {
    iterationCount++

    // Check if we've exceeded total iteration limit (including fast-forward)
    if (fastForwardIterations + iterationCount >= maxIterations) {
      break
    }

    // Check if this date is an exception
    const currentDateNormalized = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const isException = exceptionDates.some((exceptionDate: Date) => exceptionDate.getTime() === currentDateNormalized.getTime())

    // Emit only upcoming/ongoing occurrences to avoid stale historical instances
    if (currentDate >= now && !isException) {
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
      emittedCount++
    }

    // Move to next occurrence based on pattern
    const previousTimestamp = currentDate.getTime()
    currentDate = getNextOccurrence(
      currentDate,
      event.recurrencePattern,
      safeInterval,
      event.recurrenceDaysOfWeek,
      monthlyOccurrenceIndex,
      startDate
    )

    if (currentDate.getTime() === previousTimestamp) {
      break
    }
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
  daysOfWeek?: number[],
  monthlyOccurrenceIndex?: number,
  recurrenceStartDate?: Date
): Date {
  const nextDate = new Date(currentDate)

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval)
      break

    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find the next valid weekday while respecting the configured week interval
        // relative to the original recurrence start date.
        const normalizedDays = [...new Set(daysOfWeek)].sort((a, b) => a - b)
        const anchorDate = recurrenceStartDate ?? currentDate
        let nextDayFound = false
        let attempts = 0
        const maxAttempts = 14 * interval // Prevent infinite loops

        while (!nextDayFound && attempts < maxAttempts) {
          nextDate.setDate(nextDate.getDate() + 1)
          const dayOfWeek = nextDate.getDay()

          if (normalizedDays.includes(dayOfWeek) && isWithinWeeklyInterval(nextDate, anchorDate, interval)) {
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
      // If a day-of-week is provided for monthly recurrences, preserve the same
      // occurrence index in the target month (e.g., 1st Sunday, 3rd Tuesday).
      if (daysOfWeek && daysOfWeek.length > 0) {
        const targetWeekday = daysOfWeek[0]
        // Always use the original recurrence start date to compute the occurrence index.
        // Using currentDate here causes drift when months fallback to last weekday.
        const anchorDate = recurrenceStartDate ?? currentDate
        const occurrenceIndex = monthlyOccurrenceIndex ?? Math.ceil(anchorDate.getDate() / 7)
        const targetMonthDate = getNthWeekdayOfMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + interval,
          targetWeekday,
          occurrenceIndex
        )
        nextDate.setFullYear(
          targetMonthDate.getFullYear(),
          targetMonthDate.getMonth(),
          targetMonthDate.getDate()
        )
      } else {
        const originalDay = currentDate.getDate()
        nextDate.setMonth(nextDate.getMonth() + interval)
        // Handle cases where the day might not exist (e.g., 31st to February)
        // Set to last day of target month if the original day doesn't exist
        if (nextDate.getDate() !== originalDay) {
          nextDate.setDate(0) // Set to last day of target month
        }
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

function startOfWeek(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start
}

function isWithinWeeklyInterval(candidateDate: Date, recurrenceStartDate: Date, interval: number): boolean {
  const startWeek = startOfWeek(recurrenceStartDate)
  const candidateWeek = startOfWeek(candidateDate)
  const diffMs = candidateWeek.getTime() - startWeek.getTime()

  if (diffMs < 0) {
    return false
  }

  const weeksSinceStart = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  return weeksSinceStart % Math.max(1, interval) === 0
}

function fastForwardToNow(
  date: Date,
  originalEndDate: Date | null,
  now: Date,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  daysOfWeek: number[] | undefined,
  recurrenceStartDate: Date,
  monthlyOccurrenceIndex: number | undefined,
  exceptions: string[],
  maxIterations: number
): { date: Date; iterations: number } {
  const fastForwardedDate = new Date(date)
  let iterations = 0

  // If this specific occurrence is still ongoing, don't fast-forward past it
  if (originalEndDate) {
    const duration = originalEndDate.getTime() - recurrenceStartDate.getTime()
    const occurrenceEndTime = new Date(fastForwardedDate.getTime() + duration)
    if (occurrenceEndTime > now) {
      return { date: fastForwardedDate, iterations: 0 }
    }
  }

  // Cheap jump for simple fixed-size intervals (only if no exceptions to check)
  if (exceptions.length === 0 && fastForwardedDate < now && pattern === 'daily') {
    const stepMs = interval * 24 * 60 * 60 * 1000
    const jumps = Math.max(0, Math.floor((now.getTime() - fastForwardedDate.getTime()) / stepMs) - 1)
    fastForwardedDate.setTime(fastForwardedDate.getTime() + jumps * stepMs)
  } else if (exceptions.length === 0 && fastForwardedDate < now && pattern === 'weekly' && (!daysOfWeek || daysOfWeek.length === 0)) {
    const stepMs = interval * 7 * 24 * 60 * 60 * 1000
    const jumps = Math.max(0, Math.floor((now.getTime() - fastForwardedDate.getTime()) / stepMs) - 1)
    fastForwardedDate.setTime(fastForwardedDate.getTime() + jumps * stepMs)
  }

  while (fastForwardedDate < now && iterations < maxIterations) {
    const previousTimestamp = fastForwardedDate.getTime()
    const nextDate = getNextOccurrence(
      fastForwardedDate,
      pattern,
      interval,
      daysOfWeek,
      monthlyOccurrenceIndex,
      recurrenceStartDate
    )

    fastForwardedDate.setTime(nextDate.getTime())
    iterations++

    if (fastForwardedDate.getTime() === previousTimestamp) {
      break
    }
  }

  return { date: fastForwardedDate, iterations }
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  // month is zero-indexed and may overflow (Date normalizes it)
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekdayOffset = (weekday - firstOfMonth.getDay() + 7) % 7
  const firstOccurrenceDate = 1 + firstWeekdayOffset
  const candidateDay = firstOccurrenceDate + (n - 1) * 7

  const candidate = new Date(year, month, candidateDay)
  if (candidate.getMonth() === new Date(year, month, 1).getMonth()) {
    return candidate
  }

  // If nth weekday doesn't exist in this month (e.g., 5th Monday), use last.
  const lastOfMonth = new Date(year, month + 1, 0)
  const backwardOffset = (lastOfMonth.getDay() - weekday + 7) % 7
  return new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate() - backwardOffset)
}

function parseRecurrenceExceptions(recurrenceExceptions?: string): string[] {
  if (!recurrenceExceptions) {
    return []
  }

  try {
    const parsed = JSON.parse(recurrenceExceptions)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    console.warn('Invalid recurrenceExceptions JSON. Ignoring exceptions for this event.')
    return []
  }
}

function isWithinOneYearHorizon(date: Date): boolean {
  const now = new Date()
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  return date >= now && date <= oneYearFromNow
}

/**
 * Processes an array of events and generates recurring instances
 */
export function processEventsWithRecurrences(events: StrapiEvent[]): GeneratedEvent[] {
  const processedEvents: GeneratedEvent[] = []

  for (const event of events) {
    if (event.isRecurring) {
      // generateRecurringEvents starts from event.start, so it covers the base date too
      const recurringInstances = generateRecurringEvents(event)
      if (recurringInstances.length > 0) {
        processedEvents.push(...recurringInstances)
      } else if (isWithinOneYearHorizon(new Date(event.start))) {
        // Fallback: keep the original recurring event visible when no instances
        // are generated for reasons other than being out of generation horizon.
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
          isRecurring: true,
          parentId: event.documentId,
          originalEvent: event
        })
      }
    } else {
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
    }
  }

  return processedEvents
}
