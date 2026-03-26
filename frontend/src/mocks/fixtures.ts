/** Sample listing data (aligned with optional local API fixtures). */

export type HomeFixture = {
  id: string
  mls_id: string
  address: { line1: string; city: string; state: string; zip: string }
  price_cents: number
  beds: number
  baths: number
  sqft: number
  hero_image_url: string
  gallery_urls: string[]
  summary: string
  match_score: number
  community: string
}

export const FIXTURE_HOMES: HomeFixture[] = [
  {
    id: 'home-001',
    mls_id: 'MLS-10001',
    address: { line1: '410 Riverbend Dr', city: 'Austin', state: 'TX', zip: '78704' },
    price_cents: 549_000_00,
    beds: 4,
    baths: 2.5,
    sqft: 2140,
    hero_image_url: 'https://placehold.co/800x480/1a365d/white?text=Riverbend',
    gallery_urls: [],
    summary: 'Corner lot, updated kitchen, walkable to trails.',
    match_score: 0.92,
    community: 'South Lamar',
  },
  {
    id: 'home-002',
    mls_id: 'MLS-10002',
    address: { line1: '88 Live Oak Ln', city: 'Austin', state: 'TX', zip: '78745' },
    price_cents: 489_000_00,
    beds: 3,
    baths: 2.0,
    sqft: 1750,
    hero_image_url: 'https://placehold.co/800x480/2c5282/white?text=Live+Oak',
    gallery_urls: [],
    summary: 'Single story, mature trees, efficient layout.',
    match_score: 0.88,
    community: 'Sunset Valley',
  },
  {
    id: 'home-003',
    mls_id: 'MLS-10003',
    address: { line1: '1200 Vista Ridge', city: 'Round Rock', state: 'TX', zip: '78665' },
    price_cents: 625_000_00,
    beds: 5,
    baths: 3.0,
    sqft: 2680,
    hero_image_url: 'https://placehold.co/800x480/276749/white?text=Vista+Ridge',
    gallery_urls: [],
    summary: 'Two-story, flex room, near top-rated schools.',
    match_score: 0.81,
    community: 'Teravista',
  },
]

export type CustomizationOption = {
  id: string
  category: string
  label: string
  price_delta_cents: number
}

export const CUSTOMIZATION_OPTIONS: Record<string, CustomizationOption[]> = {
  'home-001': [
    {
      id: 'opt-flooring-oak',
      category: 'flooring',
      label: 'Wide-plank oak upgrade',
      price_delta_cents: 12_000_00,
    },
    {
      id: 'opt-kitchen-quartz',
      category: 'kitchen',
      label: 'Quartz counters + under-cabinet lighting',
      price_delta_cents: 8_500_00,
    },
    {
      id: 'opt-covered-patio',
      category: 'outdoor',
      label: 'Covered patio extension',
      price_delta_cents: 18_000_00,
    },
  ],
  'home-002': [
    {
      id: 'opt-garage-ext',
      category: 'garage',
      label: 'Extended garage bay',
      price_delta_cents: 9_000_00,
    },
  ],
  'home-003': [
    {
      id: 'opt-loft',
      category: 'layout',
      label: 'Loft conversion',
      price_delta_cents: 22_000_00,
    },
  ],
}
