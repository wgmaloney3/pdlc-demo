import type { AuthMe, BuyerProfile, CustomizationOption, Home } from './types'

const baseUrl = () => import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const TOKEN_KEY = 'clayton_homes_session'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const { json, ...rest } = init
  const res = await fetch(`${baseUrl()}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export async function login(email: string, password: string): Promise<string> {
  const data = await api<{ access_token: string }>('/auth/login', {
    method: 'POST',
    json: { email, password },
  })
  setStoredToken(data.access_token)
  return data.access_token
}

export async function logout(): Promise<void> {
  try {
    await api('/auth/logout', { method: 'POST' })
  } finally {
    setStoredToken(null)
  }
}

export async function fetchMe(): Promise<AuthMe> {
  return api<AuthMe>('/auth/me')
}

export async function fetchBuyerProfile(): Promise<BuyerProfile> {
  return api<BuyerProfile>('/api/buyer/profile')
}

export async function updateBuyerProfile(body: {
  answers?: Record<string, unknown>
  mark_completed?: boolean | null
}): Promise<BuyerProfile> {
  return api<BuyerProfile>('/api/buyer/profile', { method: 'PUT', json: body })
}

export async function runMatching(use_questionnaire = true): Promise<{
  homes: Home[]
  generated_at: string
  used_questionnaire: boolean
}> {
  return api('/api/matching/run', {
    method: 'POST',
    json: { use_questionnaire },
  })
}

export async function fetchHomes(params?: {
  min_price_cents?: number
  max_price_cents?: number
}): Promise<{ items: Home[]; total: number }> {
  const q = new URLSearchParams()
  if (params?.min_price_cents != null) {
    q.set('min_price_cents', String(params.min_price_cents))
  }
  if (params?.max_price_cents != null) {
    q.set('max_price_cents', String(params.max_price_cents))
  }
  const qs = q.toString()
  return api(`/api/homes${qs ? `?${qs}` : ''}`)
}

export async function fetchHome(id: string): Promise<Home> {
  return api<Home>(`/api/homes/${id}`)
}

export async function fetchFavorites(): Promise<{ items: Home[] }> {
  return api('/api/favorites')
}

export async function addFavoriteApi(home_id: string): Promise<{ home_id: string; favorited: boolean }> {
  return api('/api/favorites', { method: 'POST', json: { home_id } })
}

export async function removeFavoriteApi(home_id: string): Promise<void> {
  await api(`/api/favorites/${home_id}`, { method: 'DELETE' })
}

export async function compareHomes(ids: string[]): Promise<{ homes: Home[] }> {
  const q = new URLSearchParams({ ids: ids.join(',') })
  return api(`/api/favorites/compare?${q}`)
}

export async function fetchCustomizationOptions(
  homeId: string,
): Promise<{ home_id: string; options: CustomizationOption[] }> {
  return api(`/api/homes/${homeId}/customization/options`)
}

export async function saveCustomizationSelection(
  homeId: string,
  selected_option_ids: string[],
): Promise<{
  home_id: string
  selected_option_ids: string[]
  total_price_delta_cents: number
  updated_at: string
}> {
  return api(`/api/homes/${homeId}/customization/selection`, {
    method: 'PUT',
    json: { selected_option_ids },
  })
}
