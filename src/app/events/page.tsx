import { readData, type Event } from '@/lib/data-service'
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
function createStaticCoffeeMeetup(): EventItem {
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
    eventCategory: 'coffee',
    externalUrl: 'https://www.google.com/maps/dir//3329%20Grand%20Parkway,%20Katy,%20TX%2077449',
    externalCtaLabel: 'Get Directions',
    summary: 'Join us for a casual coffee meet up at an LGBTQ-affirming business, Coffee Fellows, to meet other LGBTQ+ community members and allies. Grab a coffee, tea, pastry or whatever suits your fancy, and make new connections or even get some work done. Enjoy a safe space of community and allyship!',
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

    // Add static coffee meetup ONLY if no coffee event already exists on that Friday
    const coffeeMeetup = createStaticCoffeeMeetup()
    const hasCoffeeOnFriday = eventItems.some(event => {
      // Check if there's a coffee category event on the same date
      const eventDate = new Date(event.start)
      const sameDay = eventDate.toDateString() === coffeeMeetup.start.toDateString()
      const isCoffeeCategory = event.eventCategory === 'coffee'
      return sameDay && isCoffeeCategory
    })
    
    if (!hasCoffeeOnFriday) {
      eventItems.push(coffeeMeetup)
    }

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
