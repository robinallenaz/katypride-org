import { getCalendarSettings } from '@/lib/calendar'
import CalendarIframe from '@/components/CalendarIframe'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const settings = await getCalendarSettings()

  // Fallback to hardcoded values if no settings found
  const calendarId = settings?.calendarId || 'c_dfbe56dae657aa4dd69c1bb10dada001e25ea91175cf28d65ce45abfcde10144@group.calendar.google.com'
  const timeZone = settings?.timeZone || 'America/Chicago'
  const calendarTitle = settings?.calendarTitle || 'Calendar'
  const calendarDescription = settings?.calendarDescription || 'View upcoming Katy Pride events and add them to your own calendar.'
  const showSubscribeButtons = settings?.showSubscribeButtons !== false // default to true

  const embedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=${encodeURIComponent(timeZone)}`
  const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`
  const icsUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`

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
            {calendarTitle}
          </h1>

          <p className="text-lg text-gray-800 leading-relaxed max-w-3xl">
            {calendarDescription}
          </p>

          {showSubscribeButtons && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-5 py-3 font-heading text-sm font-semibold tracking-wide text-white shadow-sm transition bg-gradient-to-r from-[#5f006d] to-[#760088] hover:from-[#760088] hover:to-[#8b00a2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
              >
                Open in Google Calendar
              </a>

              <a
                href={icsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/55 px-5 py-3 font-heading text-sm font-semibold tracking-wide text-gray-900 shadow-sm transition bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/75"
              >
                Subscribe (iCal)
              </a>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <CalendarIframe 
              src={embedUrl} 
              title={`${calendarTitle} Google Calendar`} 
            />
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
