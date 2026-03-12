// Stripe payment intent route - temporarily disabled
// Re-enable when STRIPE_SECRET_KEY is available
// This prevents build failures on Vercel

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe payment integration temporarily disabled' 
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Stripe payment integration temporarily disabled' 
  })
}
