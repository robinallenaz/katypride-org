 'use client'

 import { useState } from 'react'

 export default function EventsPage() {
  const eventTemplate = {
    title: 'Espresso Yourself: Community Coffee Meet-Up',
    time: '8:00 AM – 10:00 AM',
    location: 'Coffee Fellows',
    imageUrl:
      'https://res.cloudinary.com/dpus8jzix/image/upload/v1769659484/Coffee-Meet-Up-2_pumkia.png',
    imageAlt: 'Espresso Yourself community coffee meet-up flyer',
  }

  const monthAccents = [
    { stripe: 'border-l-[#760088]', border: 'border-[#760088]/20' },
    { stripe: 'border-l-[#ff1c25]', border: 'border-[#ff1c25]/20' },
    { stripe: 'border-l-[#fe931f]', border: 'border-[#fe931f]/25' },
    { stripe: 'border-l-[#06bd01]', border: 'border-[#06bd01]/25' },
    { stripe: 'border-l-[#021999]', border: 'border-[#021999]/20' },
  ]

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

  const formatLongDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)

  const formatBadgeDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date)

  const [visibleCount, setVisibleCount] = useState(3)

  const upcomingDates = buildUpcomingSecondFridays(12)
  const upcomingEvents = upcomingDates.map((date) => ({
    ...eventTemplate,
    date,
  }))

  const visibleEvents = upcomingEvents.slice(0, visibleCount)

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

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {visibleEvents.map((event, index) => {
              const accent = monthAccents[event.date.getMonth() % monthAccents.length]
              const label = index === 0 ? 'Next Up' : null

              return (
                <article
                  key={`${event.title}-${event.date.toISOString()}`}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm border-l-8 ${accent.stripe} ${accent.border}`}
                >
                  <div className="relative bg-white">
                    <img
                      src={event.imageUrl}
                      alt={event.imageAlt}
                      className="block w-full h-auto"
                      loading="lazy"
                    />

                    <div className="absolute left-3 top-3 rounded-md bg-[#feef4a] px-3 py-1.5 shadow-sm">
                      <span className="font-heading text-sm font-bold tracking-wide text-black">
                        {formatBadgeDate(event.date)}
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
                        <dd className="font-semibold">{formatLongDate(event.date)}</dd>
                      </div>

                      <div>
                        <dt className="sr-only">Time</dt>
                        <dd>{event.time}</dd>
                      </div>

                      <div>
                        <dt className="sr-only">Location</dt>
                        <dd>{event.location}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              )
            })}
          </div>

          {visibleCount < upcomingEvents.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + 3, upcomingEvents.length))}
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
