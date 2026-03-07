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
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const run = async () => {
      try {
        const events = await strapiClient.getEvents()
        setStrapiEvents(events)
      } catch (e) {
        console.error('Failed to load events from Strapi', e)
        setStrapiEvents([])
      } finally {
        setLoadingStrapi(false)
      }
    }

    run()
  }, [])

  const strapiEventItems: EventItem[] = useMemo(() => {
    const processedEvents = processEventsWithRecurrences(strapiEvents)
    
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
  }, [strapiEvents])

  const allEvents = useMemo(() => {
    return [...strapiEventItems]
      .filter((e) => !Number.isNaN(e.start.getTime()))
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
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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

              <div className="mt-8 grid gap-5 md:grid-cols-2">
              {visibleEvents.map((event, index) => {
              const startDate = event.start
              const accent = monthAccents[startDate.getMonth() % monthAccents.length]
              const label = index === 0 ? 'Next Up' : null

              return (
                <article
                  key={event.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm border-l-8 ${accent.stripe} ${accent.border}`}
                >
                  <div className="relative bg-white">
                    {event.imageSrc ? (
                      <img
                        src={event.imageSrc}
                        alt={event.imageAlt}
                        className="block w-full h-auto"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full bg-white" style={{ paddingTop: '56.25%' }} />
                    )}

                    <div className="absolute left-3 top-3 rounded-md bg-[#feef4a] px-3 py-1.5 shadow-sm">
                      <span className="font-heading text-sm font-bold tracking-wide text-black">
                        {formatBadgeDate(startDate)}
                      </span>
                    </div>

                    {label && (
                      <div className="absolute right-3 top-3 rounded-full border border-black/70 bg-white px-3.5 py-1.5 shadow-md">
                        <span className="font-heading text-sm font-extrabold tracking-wide text-gray-900">
                          {label}
                        </span>
                      </div>
                    )}

                    {event.isRecurring && (
                      <div className="absolute right-3 top-14 rounded-full border border-purple-500/50 bg-purple-100 px-3 py-1 shadow-md">
                        <span className="font-heading text-xs font-semibold tracking-wide text-purple-700">
                          🔄 Recurring
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-heading text-xl font-bold text-[#760088]">{event.title}</h2>

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
                      <details className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3">
                        <summary className="cursor-pointer font-heading text-sm font-semibold text-gray-900">
                          More info
                        </summary>
                        <div className="mt-3 text-sm leading-relaxed text-gray-700">
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
                          className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-4 py-2 font-heading text-xs font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
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
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + 3, allEvents.length))}
                className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-5 py-3 font-heading text-sm font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
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
