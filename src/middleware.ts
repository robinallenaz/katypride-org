import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ensure newsletter page always uses Next.js, not any backend CMS
  if (request.nextUrl.pathname === '/newsletter') {
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/newsletter']
}
