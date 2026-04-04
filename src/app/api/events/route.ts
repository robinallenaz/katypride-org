import { NextResponse } from 'next/server'
import { strapiClient } from '@/lib/strapi'

const isDev = process.env.NODE_ENV === 'development'

export async function GET() {
  try {
    // Log in both dev and production for debugging
    console.log('[Events API] STRAPI_URL:', process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337 (default)')
    console.log('[Events API] Token exists:', !!process.env.STRAPI_API_TOKEN)
    console.log('[Events API] Token length:', process.env.STRAPI_API_TOKEN?.length || 0)
    
    const events = await strapiClient.getEvents()
    console.log(`[Events API] Fetched ${events.length} events`)
    
    // Log image details for debugging (development only)
    if (isDev) {
      events.forEach(event => {
        console.log(`[Events API] Event "${event.title}" image:`, {
          hasImage: !!event.image,
          url: event.image?.url,
          formats: event.image?.formats ? Object.keys(event.image.formats) : 'none',
          provider: event.image?.provider
        })
      })
    }
    
    if (isDev && events.length > 0) {
      console.log('[Events API] Event titles:', events.map(e => e.title))
    }
    return NextResponse.json(events)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // Log in both dev and production for debugging
    console.error('[Events API] Failed to fetch events:', errorMessage)
    if (!isDev) {
      console.error('[Events API] STRAPI_URL used:', process.env.NEXT_PUBLIC_STRAPI_URL)
      console.error('[Events API] Token configured:', !!process.env.STRAPI_API_TOKEN)
    }
    if (isDev) {
      const errorStack = error instanceof Error ? error.stack : ''
      console.error('[Events API] Stack:', errorStack)
    }
    
    // Don't expose internal error details in production
    const responseMessage = isDev 
      ? errorMessage 
      : 'Failed to fetch events from content management system'
    
    return NextResponse.json(
      { error: responseMessage },
      { status: 500 }
    )
  }
}
