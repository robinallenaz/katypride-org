// Shared types and validation for the coffee meetup configuration.
// The config is stored as `data/coffee-meetup-config.json` and read via
// the data-service so admin edits flow into the public events page.

export interface CoffeeMeetupSpecificDate {
  date: string // YYYY-MM-DD
  title?: string
  location?: string
  timeOverride?: string | null // HH:MM (24h) or null
  notes?: string
}

export interface CoffeeMeetupConfig {
  enabled: boolean
  manualOverride: boolean
  specificDates: CoffeeMeetupSpecificDate[]
  skipMonths: number[] // 1-12
  defaultTime: string // HH:MM (24h)
  defaultDuration: number // hours
  defaultLocation: string
  title: string
  description: string
  image: string
  // Optional comment/instructions fields preserved if present in the JSON
  _comment?: string
  _instructions?: Record<string, string>
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

export function sanitizeCoffeeMeetupConfig(input: unknown): {
  config: CoffeeMeetupConfig | null
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { config: null, error: 'Config payload must be an object' }
  }
  const raw = input as Record<string, unknown>

  const defaultTime = asString(raw.defaultTime, '13:00')
  if (!TIME_RE.test(defaultTime)) {
    return { config: null, error: `Invalid defaultTime "${defaultTime}". Expected HH:MM (24h).` }
  }

  const duration = asNumber(raw.defaultDuration, 2)
  if (duration <= 0 || duration > 24) {
    return { config: null, error: 'defaultDuration must be between 0 and 24 hours' }
  }

  const skipMonthsRaw = Array.isArray(raw.skipMonths) ? raw.skipMonths : []
  const skipMonths: number[] = []
  for (const m of skipMonthsRaw) {
    const n = typeof m === 'number' ? m : Number(m)
    if (Number.isInteger(n) && n >= 1 && n <= 12 && !skipMonths.includes(n)) {
      skipMonths.push(n)
    }
  }

  const specificDatesRaw = Array.isArray(raw.specificDates) ? raw.specificDates : []
  const specificDates: CoffeeMeetupSpecificDate[] = []
  for (const item of specificDatesRaw) {
    if (!item || typeof item !== 'object') continue
    const entry = item as Record<string, unknown>
    const date = asString(entry.date)
    if (!DATE_RE.test(date)) {
      return { config: null, error: `Invalid specificDates entry: "${date}" must be YYYY-MM-DD` }
    }
    const timeOverrideValue = entry.timeOverride
    let timeOverride: string | null | undefined
    if (timeOverrideValue === null || timeOverrideValue === undefined || timeOverrideValue === '') {
      timeOverride = null
    } else if (typeof timeOverrideValue === 'string' && TIME_RE.test(timeOverrideValue)) {
      timeOverride = timeOverrideValue
    } else {
      return {
        config: null,
        error: `Invalid timeOverride for ${date}. Expected HH:MM (24h) or empty.`,
      }
    }
    specificDates.push({
      date,
      title: asString(entry.title) || undefined,
      location: asString(entry.location) || undefined,
      timeOverride,
      notes: asString(entry.notes) || undefined,
    })
  }

  const config: CoffeeMeetupConfig = {
    enabled: asBool(raw.enabled, true),
    manualOverride: asBool(raw.manualOverride, false),
    specificDates,
    skipMonths,
    defaultTime,
    defaultDuration: duration,
    defaultLocation: asString(raw.defaultLocation),
    title: asString(raw.title, 'Espresso Yourself Coffee Meet-Up'),
    description: asString(raw.description),
    image: asString(raw.image, '/espresso-yourself-new-graphic.jpg'),
  }

  if (!config.defaultLocation.trim()) {
    return { config: null, error: 'defaultLocation is required' }
  }

  if (raw._comment && typeof raw._comment === 'string') config._comment = raw._comment
  if (raw._instructions && typeof raw._instructions === 'object') {
    config._instructions = raw._instructions as Record<string, string>
  }

  return { config }
}

export const COFFEE_MEETUP_CONFIG_FILE = 'coffee-meetup-config'
