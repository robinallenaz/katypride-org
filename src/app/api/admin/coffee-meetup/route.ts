import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/data-service'
import {
  COFFEE_MEETUP_CONFIG_FILE,
  sanitizeCoffeeMeetupConfig,
  type CoffeeMeetupConfig,
} from '@/lib/coffee-meetup-config'
import { verifySession } from '../auth/route'

function authenticate(request: NextRequest): { success: boolean; response?: NextResponse } {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') ?? null
  if (!verifySession(token)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }
  return { success: true }
}

export async function GET(request: NextRequest) {
  const auth = authenticate(request)
  if (!auth.success) return auth.response

  try {
    const config = await readData<CoffeeMeetupConfig>(COFFEE_MEETUP_CONFIG_FILE)
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('[CoffeeMeetup API] Failed to read config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read coffee meetup config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if (!auth.success) return auth.response

  try {
    const payload = await request.json()
    const { config, error } = sanitizeCoffeeMeetupConfig(payload)
    if (!config) {
      return NextResponse.json(
        { success: false, error: error || 'Invalid config' },
        { status: 400 }
      )
    }

    await writeData(COFFEE_MEETUP_CONFIG_FILE, config)
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('[CoffeeMeetup API] Failed to save config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save coffee meetup config' },
      { status: 500 }
    )
  }
}
