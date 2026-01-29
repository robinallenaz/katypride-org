 'use client'

 import { useEffect, useState } from 'react'

 import { client } from '@/sanity/lib/client'
 import { urlFor } from '@/sanity/lib/image'

 type EventDoc = {
  _id: string
  title: string
  start: string
  end?: string
  location?: string
  externalUrl?: string
  image?: unknown
 }

 type EventItem = {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  externalUrl?: string
  imageSrc?: string
  imageAlt: string
 }

 export default function EventsPage() {

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

  const formatTimeRange = (startIso: string, endIso?: string) => {
    const start = new Date(startIso)
    if (!endIso) return formatTime(start)

    const end = new Date(endIso)
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()

    if (!sameDay) return `${formatTime(start)} – ${formatLongDate(end)} ${formatTime(end)}`
    return `${formatTime(start)} – ${formatTime(end)}`
  }

  const getSecondFriday = (year: number, monthIndex: number) => {
    const firstOfMonth = new Date(year, monthIndex, 1)
    const firstDay = firstOfMonth.getDay()
    const friday = 5
    const daysUntilFirstFriday = (friday - firstDay + 7) % 7
    const firstFridayDate = 1 + daysUntilFirstFriday
    const secondFridayDate = firstFridayDate + 7
    return new Date(year, monthIndex, secondFridayDate)
  }

  const buildUpcomingSecondFridays = (count: number) => {
    const now = new Date()
    const results: Date[] = []

    const startYear = now.getFullYear()
    const startMonth = now.getMonth()

    for (let i = 0; results.length < count && i < count + 24; i += 1) {
      const monthIndex = (startMonth + i) % 12
      const year = startYear + Math.floor((startMonth + i) / 12)
      const secondFriday = getSecondFriday(year, monthIndex)

      if (secondFriday >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        results.push(secondFriday)
      }
    }

    return results
  }

  const formatBadgeDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date)

  const [sanityEvents, setSanityEvents] = useState<EventDoc[]>([])
  const [loadingSanity, setLoadingSanity] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const run = async () => {
      try {
        const nowIso = new Date().toISOString()
        const query = `*[_type == "event" && coalesce(published, true) == true && start >= $now] | order(start asc)[0...50]{
          _id,
          title,
          start,
          end,
          location,
          externalUrl,
          image
        }`

        const result = await client.fetch<EventDoc[]>(query, { now: nowIso })
        setSanityEvents(result)
      } catch (e) {
        console.error('Failed to load events from Sanity', e)
        setSanityEvents([])
      } finally {
        setLoadingSanity(false)
      }
    }

    run()
  }, [])

  const recurringCoffeeMeetups: EventItem[] = buildUpcomingSecondFridays(12).map((date) => {
    const start = new Date(date)
    start.setHours(8, 0, 0, 0)

    const end = new Date(date)
    end.setHours(10, 0, 0, 0)

    return {
      id: `recurring-coffee-${date.toISOString().slice(0, 10)}`,
      title: 'Espresso Yourself: Community Coffee Meet-Up',
      start,
      end,
      location: 'Coffee Fellows',
      imageSrc:
        'https://res.cloudinary.com/dpus8jzix/image/upload/v1769659484/Coffee-Meet-Up-2_pumkia.png',
      imageAlt: 'Espresso Yourself community coffee meet-up flyer',
    }
  })

  const sanityEventItems: EventItem[] = sanityEvents.map((event) => {
    const start = new Date(event.start)
    const end = event.end ? new Date(event.end) : undefined
    const imageSrc = event.image ? urlFor(event.image).width(1400).quality(85).url() : undefined

    return {
      id: event._id,
      title: event.title,
      start,
      end,
      location: event.location,
      externalUrl: event.externalUrl,
      imageSrc,
      imageAlt: event.title,
    }
  })

  const allEvents = [...recurringCoffeeMeetups, ...sanityEventItems]
    .filter((e) => !Number.isNaN(e.start.getTime()))
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const visibleEvents = allEvents.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Events
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
            Upcoming events and community gatherings.
          </p>

          {loadingSanity && (
            <p className="mt-6 text-gray-700">Loading events…</p>
          )}

          {allEvents.length > 0 && (
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
                      <div className="absolute right-3 top-3 rounded-full border border-black/40 bg-white/95 px-3 py-1 shadow-sm">
                        <span className="font-heading text-xs font-semibold tracking-wide text-gray-900">
                          {label}
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
                        <dd>{event.location || 'TBD'}</dd>
                      </div>
                    </dl>

                    {event.externalUrl && (
                      <div className="mt-4">
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-4 py-2 font-heading text-xs font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
                        >
                          Learn more
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
            </div>
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
  )
}
