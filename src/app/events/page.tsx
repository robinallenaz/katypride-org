 'use client'

import { useEffect, useState, useMemo } from 'react'
import { strapiClient, type StrapiEvent } from '@/lib/strapi'
import { processEventsWithRecurrences, type GeneratedEvent } from '@/lib/recurring-events'
import StrapiRichText from '@/components/StrapiRichText'

type EventItem = {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  externalUrl?: string
  externalCtaLabel?: string
  imageSrc?: string
  imageAlt: string
  summary?: any // Strapi blocks content
  eventCategory?: 'general' | 'coffee' | 'social' | 'fundraising' | 'advocacy' | 'education' | 'health' | 'youth' | 'pride' | 'volunteer' | 'cultural' | 'community'
  isRecurring?: boolean
  parentId?: string
}

// Helper function to get next Sunday
function getNextSundayDate(): Date {
  const today = new Date()
  const currentDay = today.getDay()
  // If today is Sunday (0), get next Sunday (7 days away). Otherwise, calculate days until next Sunday.
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + daysUntilSunday)
  nextSunday.setHours(9, 0, 0, 0) // 9:00 AM
  return nextSunday
}

// Static coffee meet-up fallback
const createStaticCoffeeMeetup = (): StrapiEvent => {
  const nextSunday = getNextSundayDate()
  const endDate = new Date(nextSunday.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
  return {
    id: 999999,
    documentId: 'coffee-meetup-static',
    title: 'Espresso Yourself Coffee Meet-Up',
    start: nextSunday.toISOString(),
    end: endDate.toISOString(),
    location: 'Coffee Fellows, 3329 Grand Parkway, Katy, TX 77449',
    summary: {
      type: 'doc',
      children: [{
        type: 'paragraph',
        children: [{
          type: 'text',
          text: 'Join us for a casual coffee meet up at an LGBTQ-affirming business, Coffee Fellows, to meet other LGBTQ+ community members and allies. Grab a coffee, tea, pastry or whatever suits your fancy, and make new connections or even get some work done. Enjoy a safe space of community and allyship!'
        }]
      }]
    },
    published: true,
    eventCategory: 'coffee',
    isRecurring: true,
    recurrencePattern: 'monthly',
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: [0], // Sunday
    recurrenceEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    externalUrl: 'https://www.google.com/maps/dir//3329%20Grand%20Parkway,%20Katy,%20TX%2077449',
    externalCtaLabel: 'Get Directions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    image: {
      id: 999999,
      name: 'coffee-meetup.png',
      alternativeText: 'Coffee Fellows meetup - LGBTQ+ community gathering',
      url: '/events/coffee-meetup.png',
      width: 800,
      height: 600,
      provider: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    }
  }
}

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const eventCategories = [
    { value: 'all', label: 'All Events', color: 'bg-gray-500' },
    { value: 'general', label: 'General', color: 'bg-blue-500' },
    { value: 'coffee', label: 'Coffee Meetups', color: 'bg-orange-500' },
    { value: 'social', label: 'Social', color: 'bg-purple-500' },
    { value: 'fundraising', label: 'Fundraising', color: 'bg-green-500' },
    { value: 'advocacy', label: 'Advocacy', color: 'bg-red-500' },
    { value: 'education', label: 'Education', color: 'bg-indigo-500' },
    { value: 'health', label: 'Health', color: 'bg-pink-500' },
    { value: 'youth', label: 'Youth', color: 'bg-yellow-500' },
    { value: 'pride', label: 'Pride', color: 'bg-rainbow-gradient' },
    { value: 'volunteer', label: 'Volunteer', color: 'bg-teal-500' },
    { value: 'cultural', label: 'Cultural', color: 'bg-amber-500' },
    { value: 'community', label: 'Community', color: 'bg-lime-500' },
  ]

  const monthAccents = [
    { stripe: 'border-l-[#760088]', border: 'border-[#760088]/20' },
    { stripe: 'border-l-[#ff1c25]', border: 'border-[#ff1c25]/20' },
    { stripe: 'border-l-[#fe931f]', border: 'border-[#fe931f]/25' },
    { stripe: 'border-l-[#06bd01]', border: 'border-[#06bd01]/25' },
    { stripe: 'border-l-[#021999]', border: 'border-[#021999]/20' },
  ]

  const formatLongDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)

  const formatBadgeDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date)

  const [strapiEvents, setStrapiEvents] = useState<StrapiEvent[]>([])
  const [loadingStrapi, setLoadingStrapi] = useState(true)
  const [strapiError, setStrapiError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(3)
  useEffect(() => {
    const run = async () => {
      // Cache key defined here so it's available in both try and catch blocks
      const cacheKey = 'strapi-events-cache'
      
      try {
        setLoadingStrapi(true)
        setStrapiError(null)
        
        // Check cache first (5-minute cache)
        const cachedData = sessionStorage.getItem(cacheKey)
        
        if (cachedData) {
          try {
            const { events, timestamp, source } = JSON.parse(cachedData)
            const now = Date.now()
            
            // Use only successful API cache if less than 5 minutes old.
            if (source === 'api' && now - timestamp < 300000) {
              setStrapiEvents(events)
              setLoadingStrapi(false)
              return
            }
            
            // Use fallback cache only if less than 1 minute old
            if (source === 'fallback' && now - timestamp < 60000) {
              setStrapiEvents(events)
              setLoadingStrapi(false)
              return
            }

            sessionStorage.removeItem(cacheKey)
          } catch (cacheError) {
            console.warn('Failed to parse events cache:', cacheError)
            sessionStorage.removeItem(cacheKey)
          }
        }
        
        // Fetch fresh data from our API route (server has access to token)
        const response = await fetch('/api/events')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const events = await response.json()
        console.log('[Events] API returned', events.length, 'events:', events.map((e: any) => e.title))
        
        // Always add static coffee meet-up to ensure recurring events appear
        const coffeeMeetup = createStaticCoffeeMeetup()
        console.log('[Events] Created coffee meetup:', coffeeMeetup.title, coffeeMeetup.start)
        const eventsWithFallback = [...events, coffeeMeetup]
        console.log('[Events] Combined events:', eventsWithFallback.length, eventsWithFallback.map((e: any) => e.title))
        
        setStrapiEvents(eventsWithFallback)
        
        // Cache the results
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            events: eventsWithFallback,
            timestamp: Date.now(),
            source: 'api'
          }))
        } catch (cacheError) {
          console.warn('Failed to cache events:', cacheError)
        }
        
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error'
        console.warn('Failed to load events:', errorMessage)
        setStrapiError(errorMessage)
        // Use fallback events when API is down
        const fallbackEvents = [createStaticCoffeeMeetup()]
        setStrapiEvents(fallbackEvents)

        // Cache fallback with shorter TTL (1 minute) to retry soon
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            events: fallbackEvents,
            timestamp: Date.now(),
            source: 'fallback'
          }))
        } catch (cacheError) {
          console.warn('Failed to cache fallback events:', cacheError)
        }

      } finally {
        setLoadingStrapi(false)
      }
    }

    run()
  }, [])

  const strapiEventItems: EventItem[] = useMemo(() => {
    console.log('[Events] Processing', strapiEvents.length, 'events:', strapiEvents.map(e => ({ title: e.title, isRecurring: e.isRecurring, start: e.start })))
    const processedEvents = processEventsWithRecurrences(strapiEvents)
    console.log('[Events] Processed events:', processedEvents.length, processedEvents.map(e => ({ title: e.title, start: e.start })))
    
    return processedEvents.map((event) => {
      const imageSrc = event.image ? strapiClient.getImageUrlWithSize(event.image, 'large') : undefined

      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        location: event.location,
        externalUrl: event.externalUrl,
        externalCtaLabel: event.externalCtaLabel,
        imageSrc,
        imageAlt: event.image?.alternativeText || event.title,
        summary: event.summary,
        eventCategory: event.eventCategory,
        isRecurring: event.isRecurring,
        parentId: event.parentId,
      }
    })
  }, [strapiEvents.length, strapiEvents.map((e) => (e.id + e.updatedAt)).join(',')])

  const allEvents = useMemo(() => {
    // Use local date for consistent date-based comparison with event times
    const now = new Date()
    const todayDateString = now.toDateString()

    return [...strapiEventItems]
      .filter((e) => !Number.isNaN(e.start.getTime()))
      .filter((e) => {
        const validEnd = e.end && !Number.isNaN(e.end.getTime()) ? e.end : null
        const comparisonDate = validEnd ?? e.start
        // Compare using local date strings to handle timezone correctly
        return comparisonDate.toDateString() >= todayDateString
      })
      .filter((event) => {
        const matchesCategory = selectedCategory === 'all' || event.eventCategory === selectedCategory
        const matchesSearch = searchTerm === '' || 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [strapiEventItems, selectedCategory, searchTerm])

  const visibleEvents = allEvents.slice(0, visibleCount)

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#760088] text-white px-4 py-2 rounded-md font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
        <section id="main-content" className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Events
          </h1>

          <p className="text-lg text-gray-800 leading-relaxed max-w-3xl">
            Upcoming events and community gatherings.
          </p>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search events by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#760088] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {eventCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? `${category.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {loadingStrapi && (
            <p className="mt-6 text-gray-700">Loading events…</p>
          )}

          {strapiError && strapiEvents.length === 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Event loading temporarily unavailable
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>We're having trouble loading events from our content management system. This doesn't affect the rest of the website functionality.</p>
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Technical details</summary>
                        <pre className="mt-1 text-xs bg-amber-100 p-2 rounded overflow-auto">
                          {strapiError}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loadingStrapi && allEvents.length === 0 && (
            <div className="mt-8 text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for upcoming events!'}
              </p>
            </div>
          )}

          {!loadingStrapi && allEvents.length > 0 && (
            <>
              <div className="mt-6 text-sm text-gray-600">
                Showing {visibleEvents.length} of {allEvents.length} events
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${eventCategories.find(c => c.value === selectedCategory)?.label}`}
              </div>

              <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2">
              {visibleEvents.map((event, index) => {
              const startDate = event.start
              const accent = monthAccents[startDate.getMonth() % monthAccents.length]
              const label = index === 0 ? 'Next Up' : null

              return (
                <article
                  key={event.id}
                  className={`overflow-hidden rounded-xl sm:rounded-2xl border bg-white shadow-sm border-l-4 sm:border-l-8 ${accent.stripe} ${accent.border}`}
                >
                  <div className="relative bg-gray-100">
                    {event.eventCategory === 'coffee' ? (
                      <img
                        src="/espresso-yourself-new-graphic.jpg"
                        alt="Espresso Yourself Coffee Meetup"
                        className="block w-full h-auto"
                        loading="lazy"
                      />
                    ) : event.imageSrc ? (
                      <img
                        src={event.imageSrc}
                        alt={event.imageAlt}
                        className="block w-full h-auto"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target;
                          if (target instanceof HTMLImageElement) {
                            target.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full bg-gray-100" style={{ paddingTop: '56.25%' }} />
                    )}

                    {label && (
                      <div className="absolute right-2 sm:right-3 top-2 sm:top-3 rounded-full border border-black/70 bg-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-md z-10">
                        <span className="font-heading text-xs sm:text-sm font-extrabold tracking-wide text-gray-900">
                          {label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Date Badge - moved to content area to prevent overlap */}
                    <div className="inline-flex items-center rounded-md bg-[#feef4a] px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm mb-3">
                      <span className="font-heading text-xs sm:text-sm font-bold tracking-wide text-black">
                        {formatBadgeDate(startDate)}
                      </span>
                    </div>

                    <h2 className="font-heading text-lg sm:text-xl font-bold text-[#760088]">{event.title}</h2>

                    <dl className="mt-3 grid gap-1 text-gray-800">
                      <div>
                        <dt className="sr-only">Date</dt>
                        <dd className="font-semibold">{formatLongDate(startDate)}</dd>
                      </div>

                      <div>
                        <dt className="sr-only">Time</dt>
                        <dd>
                          {event.end
                            ? `${formatTime(event.start)} – ${formatTime(event.end)}`
                            : formatTime(event.start)}
                        </dd>
                      </div>

                      <div>
                        <dt className="sr-only">Location</dt>
                        <dd>
                          {event.location || 'TBD'}
                        </dd>
                      </div>
                    </dl>

                    {event.summary && (
                      <details className="mt-3 sm:mt-4 rounded-xl border border-black/10 bg-white px-3 sm:px-4 py-2 sm:py-3">
                        <summary className="cursor-pointer font-heading text-xs sm:text-sm font-semibold text-gray-900">
                          More info
                        </summary>
                        <div className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-gray-700">
                          <StrapiRichText content={event.summary} />
                        </div>
                      </details>
                    )}

                    {event.externalUrl && (
                      <div className="mt-4">
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-3 sm:px-4 py-1.5 sm:py-2 font-heading text-xs sm:text-xs font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
                        >
                          {event.externalCtaLabel || 'Learn more'}
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
            </div>
            </>
          )}

          {visibleCount < allEvents.length && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + 3, allEvents.length))}
                className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-4 sm:px-5 py-2.5 sm:py-3 font-heading text-sm font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  )
}
