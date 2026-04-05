import { strapiClient } from '@/lib/strapi'
import { processEventsWithRecurrences } from '@/lib/recurring-events'
import EventsList, { type EventItem } from './EventsList'

// Helper function to get next Friday
function getNextFridayDate(): Date {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 5 = Friday
  const daysUntilFriday = currentDay < 5 ? 5 - currentDay : 5 + (7 - currentDay)
  const nextFriday = new Date(today)
  nextFriday.setDate(today.getDate() + daysUntilFriday)
  nextFriday.setHours(9, 0, 0, 0)
  return nextFriday
}

// Static coffee meet-up fallback
function createStaticCoffeeMeetup() {
  const nextFriday = getNextFridayDate()
  const endDate = new Date(nextFriday.getTime() + 2 * 60 * 60 * 1000)
  return {
    id: 'coffee-meetup-static',
    title: 'Espresso Yourself Coffee Meet-Up',
    start: nextFriday,
    end: endDate,
    location: 'Coffee Fellows, 3329 Grand Parkway, Katy, TX 77449',
    imageSrc: '/espresso-yourself-new-graphic.jpg',
    imageAlt: 'Espresso Yourself Coffee Meetup',
    eventCategory: 'coffee' as const,
    externalUrl: 'https://www.google.com/maps/dir//3329%20Grand%20Parkway,%20Katy,%20TX%2077449',
    externalCtaLabel: 'Get Directions',
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
  }
}

// Server-side data fetching with caching
async function getEvents(): Promise<{ events: EventItem[]; error?: string | null }> {
  try {
    const strapiEvents = await strapiClient.getEvents()
    const processedEvents = processEventsWithRecurrences(strapiEvents)

    const eventItems: EventItem[] = processedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.location,
      externalUrl: event.externalUrl,
      externalCtaLabel: event.externalCtaLabel,
      imageSrc: event.image ? strapiClient.getImageUrlWithSize(event.image, 'large') : undefined,
      imageSrcOriginal: event.image ? strapiClient.getImageUrl(event.image) : undefined,
      imageAlt: event.image?.alternativeText || event.title,
      summary: event.summary,
      eventCategory: event.eventCategory,
      isRecurring: event.isRecurring,
      parentId: event.parentId,
    }))

    // Add static coffee meetup
    const coffeeMeetup = createStaticCoffeeMeetup()
    eventItems.push(coffeeMeetup)

    // Sort by date
    eventItems.sort((a, b) => a.start.getTime() - b.start.getTime())

    return { events: eventItems, error: null }
  } catch (error) {
    console.error('Failed to fetch events:', error)
    // Return just the coffee meetup as fallback
    return { events: [createStaticCoffeeMeetup()], error: 'Failed to load events' }
  }
}

// Revalidate page every 60 seconds (ISR)
export const revalidate = 60

export default async function EventsPage() {
  const { events, error } = await getEvents()

  return <EventsList initialEvents={events} error={error} />
}
