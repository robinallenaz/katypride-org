import { NextResponse } from 'next/server'
import { strapiClient } from '@/lib/strapi'

export async function GET() {
  try {
    const events = await strapiClient.getEvents()
    console.log(`[Events API] Fetched ${events.length} events`)
    if (events.length > 0) {
      console.log('[Events API] Event titles:', events.map(e => e.title))
    }
    return NextResponse.json(events)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[Events API] Failed to fetch events:', errorMessage)
    console.error('[Events API] Stack:', errorStack)
    return NextResponse.json(
      { error: 'Failed to fetch events', details: errorMessage },
      { status: 500 }
    )
  }
}
