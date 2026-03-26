import { v5 as uuidv5 } from 'uuid'

import { CUSTOMIZATION_OPTIONS, FIXTURE_HOMES, type HomeFixture } from './fixtures'

const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

export type Session = { user_id: string; email: string; logged_in_at: string }

export type BuyerProfile = {
  user_id: string
  email: string
  questionnaire: { completed: boolean; answers: Record<string, unknown> }
  updated_at: string
}

export const sessions = new Map<string, Session>()
export const buyerProfiles = new Map<string, BuyerProfile>()
export const favorites = new Map<string, Set<string>>()

export function utcNow(): string {
  return new Date().toISOString()
}

export function userIdFromEmail(email: string): string {
  return uuidv5(email, NAMESPACE_DNS)
}

export function cloneHomes(): HomeFixture[] {
  return structuredClone(FIXTURE_HOMES)
}

export function homeIds(): Set<string> {
  return new Set(FIXTURE_HOMES.map((h) => h.id))
}

export function getCustomizationOptions(homeId: string) {
  return structuredClone(CUSTOMIZATION_OPTIONS[homeId] ?? [])
}
