 'use client'

 import { useEffect, useState } from 'react'
 import { PortableText } from '@portabletext/react'

 import { client } from '@/sanity/lib/client'
 import { urlFor } from '@/sanity/lib/image'

 type PortableTextValue = any[]

 type EventDoc = {
  _id: string
  title: string
  start: string
  end?: string
  location?: string
  externalUrl?: string
  externalCtaLabel?: string
  image?: unknown
  summary?: PortableTextValue
 }

 type CoffeeMeetupOverrideDoc = {
  _id: string
  meetupDate: string
  cancelled?: boolean
  title?: string
  start?: string
  end?: string
  location?: string
  address?: string
  directionsUrl?: string
  externalUrl?: string
  externalCtaLabel?: string
  image?: unknown
  summary?: PortableTextValue
 }

 type EventItem = {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  address?: string
  directionsUrl?: string
  externalUrl?: string
  externalCtaLabel?: string
  imageSrc?: string
  imageAlt: string
  summary?: PortableTextValue
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
  const [coffeeMeetupOverrides, setCoffeeMeetupOverrides] = useState<CoffeeMeetupOverrideDoc[]>([])
  const [loadingSanity, setLoadingSanity] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const run = async () => {
      try {
        const nowIso = new Date().toISOString()
        const todayDate = nowIso.slice(0, 10)
        const query = `*[_type == "event" && coalesce(published, true) == true && start >= $now] | order(start asc)[0...50]{
          _id,
          title,
          start,
          end,
          location,
          externalUrl,
          externalCtaLabel,
          image,
          summary
        }`

        const coffeeOverrideQuery = `*[_type == "coffeeMeetupOverride" && meetupDate >= $today] | order(meetupDate asc)[0...50]{
          _id,
          meetupDate,
          cancelled,
          title,
          start,
          end,
          location,
          address,
          directionsUrl,
          externalUrl,
          externalCtaLabel,
          image,
          summary
        }`

        const [eventsResult, coffeeOverrideResult] = await Promise.all([
          client.fetch<EventDoc[]>(query, { now: nowIso }),
          client.fetch<CoffeeMeetupOverrideDoc[]>(coffeeOverrideQuery, { today: todayDate }),
        ])

        setSanityEvents(eventsResult)
        setCoffeeMeetupOverrides(coffeeOverrideResult)
      } catch (e) {
        console.error('Failed to load events from Sanity', e)
        setSanityEvents([])
        setCoffeeMeetupOverrides([])
      } finally {
        setLoadingSanity(false)
      }
    }

    run()
  }, [])

  const coffeeOverrideByDateKey = new Map(
    coffeeMeetupOverrides
      .filter((o) => Boolean(o.meetupDate))
      .map((o) => [o.meetupDate, o] as const),
  )

  const recurringCoffeeMeetups: EventItem[] = buildUpcomingSecondFridays(12)
    .map<EventItem | null>((date) => {
      const dateKey = date.toISOString().slice(0, 10)
      const override = coffeeOverrideByDateKey.get(dateKey)
      if (override?.cancelled) return null

      const start = override?.start ? new Date(override.start) : new Date(date)
      if (!override?.start) start.setHours(8, 0, 0, 0)

      const end: Date | undefined = override?.end ? new Date(override.end) : new Date(date)
      if (!override?.end) end.setHours(10, 0, 0, 0)

      const imageSrc = override?.image ? urlFor(override.image).width(1400).quality(85).url() : undefined

      return {
        id: `recurring-coffee-${dateKey}`,
        title: override?.title || 'Espresso Yourself: Community Coffee Meet-Up',
        start,
        end,
        location: override?.location || 'Coffee Fellows',
        address: override?.address || '3329 Grand Parkway, Katy, TX 77449',
        directionsUrl:
          override?.directionsUrl || 'https://www.google.com/maps/dir//3329%20Grand%20Parkway,%20Katy,%20TX%2077449',
        externalUrl: override?.externalUrl,
        externalCtaLabel: override?.externalCtaLabel,
        imageSrc:
          imageSrc ||
          'https://res.cloudinary.com/dpus8jzix/image/upload/v1769659484/Coffee-Meet-Up-2_pumkia.png',
        imageAlt: override?.title || 'Espresso Yourself community coffee meet-up flyer',
        summary: override?.summary,
      }
    })
    .filter((e): e is EventItem => e !== null)

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
      externalCtaLabel: event.externalCtaLabel,
      imageSrc,
      imageAlt: event.title,
      summary: event.summary,
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
                        <dd>
                          <div>{event.location || 'TBD'}</div>
                          {event.address && (
                            <div className="mt-1 text-sm text-gray-700">{event.address}</div>
                          )}
                          {event.directionsUrl && (
                            <a
                              href={event.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block font-heading text-xs font-semibold tracking-wide text-gray-900 underline underline-offset-2"
                            >
                              Get directions
                            </a>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {Array.isArray(event.summary) && event.summary.length > 0 && (
                      <details className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3">
                        <summary className="cursor-pointer font-heading text-sm font-semibold text-gray-900">
                          More info
                        </summary>
                        <div className="mt-3 text-sm leading-relaxed text-gray-700">
                          <PortableText value={event.summary} />
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
