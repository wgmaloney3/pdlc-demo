export type Address = {
  line1: string
  city: string
  state: string
  zip: string
}

export type Home = {
  id: string
  mls_id: string
  address: Address
  price_cents: number
  beds: number
  baths: number
  sqft: number
  hero_image_url: string
  gallery_urls: string[]
  summary: string
  match_score: number
  community: string
  description_long?: string
  schools?: { name: string; rating: number; level?: 'elementary' | 'middle' | 'high' }[]
}

export type AuthMe = {
  user_id: string
  email: string
  profile: BuyerProfile
}

export type BuyerProfile = {
  user_id: string
  email: string
  questionnaire: { completed: boolean; answers: Record<string, unknown> }
  updated_at: string
}

export type CustomizationOption = {
  id: string
  category: string
  label: string
  price_delta_cents: number
}
