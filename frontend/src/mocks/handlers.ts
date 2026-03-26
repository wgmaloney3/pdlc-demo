import { http, HttpResponse } from 'msw'

import { CUSTOMIZATION_OPTIONS } from './fixtures'
import {
  buyerProfiles,
  cloneHomes,
  favorites,
  getCustomizationOptions,
  homeIds,
  sessions,
  utcNow,
  userIdFromEmail,
  type BuyerProfile,
} from './state'

const base = () => import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

function requireSession(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.toLowerCase().startsWith('bearer ')) {
    return HttpResponse.json({ detail: 'Missing bearer token' }, { status: 401 })
  }
  const token = auth.slice(7).trim()
  const sess = sessions.get(token)
  if (!sess) {
    return HttpResponse.json({ detail: 'Invalid or expired token' }, { status: 401 })
  }
  return sess
}

export const handlers = [
  http.post(`${base()}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email ?? 'buyer@example.com'
    const token = crypto.randomUUID()
    const user_id = userIdFromEmail(email)
    sessions.set(token, {
      user_id,
      email,
      logged_in_at: utcNow(),
    })
    if (!buyerProfiles.has(user_id)) {
      buyerProfiles.set(user_id, {
        user_id,
        email,
        questionnaire: { completed: false, answers: {} },
        updated_at: utcNow(),
      })
    }
    if (!favorites.has(user_id)) {
      favorites.set(user_id, new Set())
    }
    return HttpResponse.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600,
    })
  }),

  http.post(`${base()}/auth/logout`, ({ request }) => {
    const auth = request.headers.get('authorization')
    if (auth?.toLowerCase().startsWith('bearer ')) {
      sessions.delete(auth.slice(7).trim())
    }
    return HttpResponse.json({ status: 'ok' })
  }),

  http.get(`${base()}/auth/me`, ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const profile = buyerProfiles.get(sessOr.user_id) ?? ({} as BuyerProfile)
    return HttpResponse.json({
      user_id: sessOr.user_id,
      email: sessOr.email,
      profile,
    })
  }),

  http.get(`${base()}/api/buyer/profile`, ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const rec = buyerProfiles.get(sessOr.user_id)
    if (!rec) {
      return HttpResponse.json({ detail: 'Profile not found' }, { status: 404 })
    }
    return HttpResponse.json(structuredClone(rec))
  }),

  http.put(`${base()}/api/buyer/profile`, async ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const patch = (await request.json()) as {
      answers?: Record<string, unknown>
      mark_completed?: boolean | null
    }
    const rec = buyerProfiles.get(sessOr.user_id)
    if (!rec) {
      return HttpResponse.json({ detail: 'Profile not found' }, { status: 404 })
    }
    if (patch.answers) {
      Object.assign(rec.questionnaire.answers, patch.answers)
    }
    if (patch.mark_completed === true) {
      rec.questionnaire.completed = true
    }
    rec.updated_at = utcNow()
    return HttpResponse.json(structuredClone(rec))
  }),

  http.post(`${base()}/api/matching/run`, async ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const body = (await request.json().catch(() => ({}))) as { use_questionnaire?: boolean }
    const ranked = cloneHomes().sort((a, b) => b.match_score - a.match_score)
    return HttpResponse.json({
      generated_at: utcNow(),
      homes: ranked,
      used_questionnaire: body.use_questionnaire !== false,
    })
  }),

  http.get(`${base()}/api/homes`, ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const url = new URL(request.url)
    const min = url.searchParams.get('min_price_cents')
    const max = url.searchParams.get('max_price_cents')
    let homes = cloneHomes()
    if (min != null) {
      const n = Number(min)
      homes = homes.filter((h) => h.price_cents >= n)
    }
    if (max != null) {
      const n = Number(max)
      homes = homes.filter((h) => h.price_cents <= n)
    }
    return HttpResponse.json({ items: homes, total: homes.length })
  }),

  http.get(`${base()}/api/homes/:homeId/customization/options`, ({ request, params }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const homeId = params.homeId as string
    return HttpResponse.json({
      home_id: homeId,
      options: getCustomizationOptions(homeId),
    })
  }),

  http.put(`${base()}/api/homes/:homeId/customization/selection`, async ({
    request,
    params,
  }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const homeId = params.homeId as string
    const body = (await request.json()) as { selected_option_ids?: string[] }
    const picked = (body.selected_option_ids ?? []).filter((id) =>
      getCustomizationOptions(homeId).some((o) => o.id === id),
    )
    const opts = CUSTOMIZATION_OPTIONS[homeId] ?? []
    const total_delta = opts
      .filter((o) => picked.includes(o.id))
      .reduce((s, o) => s + o.price_delta_cents, 0)
    return HttpResponse.json({
      home_id: homeId,
      selected_option_ids: picked,
      total_price_delta_cents: total_delta,
      updated_at: utcNow(),
    })
  }),

  http.get(`${base()}/api/homes/:homeId`, ({ request, params }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const hid = params.homeId as string
    const h = cloneHomes().find((x) => x.id === hid)
    if (!h) {
      return HttpResponse.json({ detail: 'Home not found' }, { status: 404 })
    }
    const detail = {
      ...structuredClone(h),
      description_long:
        'Spacious layout with natural light, an open kitchen and dining area, and a private outdoor space ideal for entertaining. Energy-efficient windows and quality finishes throughout.',
      schools: [{ name: 'Lakewood High School', rating: 8 }],
    }
    return HttpResponse.json(detail)
  }),

  http.get(`${base()}/api/favorites`, ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const ids = favorites.get(sessOr.user_id) ?? new Set()
    const items = cloneHomes().filter((h) => ids.has(h.id))
    return HttpResponse.json({ items })
  }),

  http.post(`${base()}/api/favorites`, async ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const body = (await request.json()) as { home_id?: string }
    const hid = body.home_id
    if (!hid || !homeIds().has(hid)) {
      return HttpResponse.json({ detail: 'Home not found' }, { status: 404 })
    }
    const set = favorites.get(sessOr.user_id) ?? new Set()
    set.add(hid)
    favorites.set(sessOr.user_id, set)
    return HttpResponse.json({ home_id: hid, favorited: true })
  }),

  http.delete(`${base()}/api/favorites/:homeId`, ({ request, params }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const hid = params.homeId as string
    favorites.get(sessOr.user_id)?.delete(hid)
    return HttpResponse.json({ status: 'ok' })
  }),

  http.get(`${base()}/api/favorites/compare`, ({ request }) => {
    const sessOr = requireSession(request)
    if (sessOr instanceof HttpResponse) return sessOr
    const url = new URL(request.url)
    const ids = (url.searchParams.get('ids') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const homes = cloneHomes().filter((h) => ids.includes(h.id))
    return HttpResponse.json({ homes })
  }),

  http.get(`${base()}/health`, () => HttpResponse.json({ status: 'ok' })),
]
