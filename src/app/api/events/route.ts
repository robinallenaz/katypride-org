import { NextResponse } from 'next/server'
import { strapiClient } from '@/lib/strapi'

export async function GET() {
  try {
    const events = await strapiClient.getEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
