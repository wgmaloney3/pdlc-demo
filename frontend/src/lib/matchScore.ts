import type { Home } from '@/api/types'

/** Questionnaire answer keys (aligned with QuestionnairePage form). */
export type QuestionnaireAnswers = {
  budgetMax?: number
  preferredCities?: string
  minBeds?: number
  minBaths?: number
  minSqft?: number
  singleStory?: boolean
  accessibilityNotes?: string
  styles?: string[]
}

export function normalizeAnswers(raw: Record<string, unknown> | undefined): QuestionnaireAnswers {
  if (!raw || typeof raw !== 'object') return {}
  const styles = raw.styles
  return {
    budgetMax: coerceNumber(raw.budgetMax),
    preferredCities: typeof raw.preferredCities === 'string' ? raw.preferredCities : undefined,
    minBeds: coerceNumber(raw.minBeds),
    minBaths: coerceNumber(raw.minBaths),
    minSqft: coerceNumber(raw.minSqft),
    singleStory: typeof raw.singleStory === 'boolean' ? raw.singleStory : undefined,
    accessibilityNotes: typeof raw.accessibilityNotes === 'string' ? raw.accessibilityNotes : undefined,
    styles: Array.isArray(styles) ? styles.filter((x): x is string => typeof x === 'string') : undefined,
  }
}

function coerceNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

/**
 * Score 0–1 from questionnaire fit (used by MSW / mock API when matching runs).
 */
export function scoreHomeWithQuestionnaire(home: Home, q: QuestionnaireAnswers): number {
  let score = 0.32

  const budgetMax = q.budgetMax ?? 2_000_000
  const budgetCents = budgetMax * 100
  if (home.price_cents <= budgetCents) {
    score += 0.26
  } else {
    score += 0.26 * Math.min(1, budgetCents / home.price_cents)
  }

  const minBeds = q.minBeds ?? 1
  const minBaths = q.minBaths ?? 1
  const minSqft = q.minSqft ?? 0

  if (home.beds >= minBeds) score += 0.14
  else score += 0.14 * Math.max(0, home.beds / minBeds)

  if (home.baths >= minBaths) score += 0.12
  else score += 0.12 * Math.max(0, home.baths / minBaths)

  if (minSqft > 0) {
    if (home.sqft >= minSqft) score += 0.12
    else score += 0.12 * Math.max(0, home.sqft / minSqft)
  } else {
    score += 0.12
  }

  if (q.singleStory === true) {
    if (/single[\s-]?story/i.test(home.summary)) score += 0.1
    else if (home.sqft < 2100 && home.beds <= 3) score += 0.04
  }

  const styles = q.styles ?? []
  const hay = `${home.summary} ${home.community}`.toLowerCase()
  for (const s of styles) {
    const word = s.toLowerCase().split(/\s+/)[0] ?? ''
    if (word.length > 2 && hay.includes(word)) score += 0.025
  }

  const cities = (q.preferredCities ?? '').toLowerCase()
  if (cities) {
    const city = home.address.city.toLowerCase()
    if (cities.includes(city)) score += 0.06
  }

  return Math.round(Math.min(0.99, Math.max(0.28, score)) * 1000) / 1000
}

export function applyQuestionnaireToHomes(homes: Home[], answers: Record<string, unknown> | undefined): Home[] {
  const q = normalizeAnswers(answers)
  const scored = homes.map((h) => ({
    ...h,
    match_score: scoreHomeWithQuestionnaire(h, q),
  }))
  scored.sort((a, b) => b.match_score - a.match_score)
  return scored
}

/** True if the home meets minimum questionnaire requirements (for client-side listing). */
export function homePassesQuestionnaireHardFilters(home: Home, q: QuestionnaireAnswers): boolean {
  if (q.minBeds != null && home.beds < q.minBeds) return false
  if (q.minBaths != null && home.baths + 1e-9 < q.minBaths) return false
  if (q.minSqft != null && q.minSqft > 0 && home.sqft < q.minSqft) return false
  if (q.budgetMax != null && home.price_cents > Math.round(q.budgetMax * 100)) return false
  if (q.singleStory === true && !/single[\s-]?story/i.test(home.summary)) return false
  return true
}

/**
 * Max listing price in cents from the slider value (millions of USD), e.g. 0.55 → $550,000 → 55_000_000 cents.
 */
export function maxPriceCentsFromSliderMillions(maxPriceMil: number): number {
  return Math.round(maxPriceMil * 1_000_000 * 100)
}
