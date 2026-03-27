/** Sample listing data (aligned with optional local API fixtures). */

/** Unsplash stills — suburban & new-build US homes, warm climates (fits Central Texas listings). */
const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=82`

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
    hero_image_url: img('1600585154340-be6161a56a0c'),
    gallery_urls: [
      img('1600607687939-ce8a6c25118c'),
      img('1600210492486-724fe5c67fb0'),
      img('1564013799919-ab600027ffc6'),
      img('1582268611958-ebfd161ef9cf'),
    ],
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
    hero_image_url: img('1600596542815-ffad4c1539a9'),
    gallery_urls: [
      img('1605276374104-dee2a0ed3cd6'),
      img('1616594039964-ae9021a400a0'),
      img('1568605114967-8130f3a36994'),
      img('1600585154340-be6161a56a0c'),
    ],
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
    hero_image_url: img('1512917774080-9991f1c4c750'),
    gallery_urls: [
      img('1613490493576-7fde63acd811'),
      img('1600585154526-990dced4db0d'),
      img('1600047509807-ba8f99d2cdde'),
      img('1568605114967-8130f3a36994'),
    ],
    summary: 'Two-story, flex room, near top-rated schools.',
    match_score: 0.81,
    community: 'Teravista',
  },
  {
    id: 'home-004',
    mls_id: 'MLS-10004',
    address: { line1: '2210 Brushy Creek Trl', city: 'Cedar Park', state: 'TX', zip: '78613' },
    price_cents: 429_000_00,
    beds: 3,
    baths: 2.0,
    sqft: 1820,
    hero_image_url: img('1570129477492-45c003edd2be'),
    gallery_urls: [
      img('1600585154340-be6161a56a0c'),
      img('1605276374104-dee2a0ed3cd6'),
      img('1616594039964-ae9021a400a0'),
      img('1600210492486-724fe5c67fb0'),
    ],
    summary: 'Craftsman elevation, open living, community pool and trails nearby.',
    match_score: 0.79,
    community: 'Brushy Creek',
  },
  {
    id: 'home-005',
    mls_id: 'MLS-10005',
    address: { line1: '904 Pecan St', city: 'Georgetown', state: 'TX', zip: '78626' },
    price_cents: 395_000_00,
    beds: 3,
    baths: 2.0,
    sqft: 1680,
    hero_image_url: img('1582268611958-ebfd161ef9cf'),
    gallery_urls: [
      img('1600585154340-be6161a56a0c'),
      img('1605276374104-dee2a0ed3cd6'),
      img('1615529328331-f8917597711f'),
      img('1600566753086-00f18fb6b3ea'),
    ],
    summary: 'Traditional brick, shaded backyard, short drive to historic square.',
    match_score: 0.77,
    community: 'Old Town',
  },
  {
    id: 'home-006',
    mls_id: 'MLS-10006',
    address: { line1: '55 Hill Country Vw', city: 'Dripping Springs', state: 'TX', zip: '78620' },
    price_cents: 715_000_00,
    beds: 4,
    baths: 3.5,
    sqft: 3020,
    hero_image_url: img('1600047509807-ba8f99d2cdde'),
    gallery_urls: [
      img('1613490493576-7fde63acd811'),
      img('1564013799919-ab600027ffc6'),
      img('1600607687939-ce8a6c25118c'),
      img('1512917774080-9991f1c4c750'),
    ],
    summary: 'Contemporary design, wall of windows, acre lot with Hill Country views.',
    match_score: 0.84,
    community: 'Belterra',
  },
  {
    id: 'home-007',
    mls_id: 'MLS-10007',
    address: { line1: '1802 Falcon Pointe Blvd', city: 'Pflugerville', state: 'TX', zip: '78660' },
    price_cents: 512_000_00,
    beds: 4,
    baths: 2.5,
    sqft: 2280,
    hero_image_url: img('1600585154526-990dced4db0d'),
    gallery_urls: [
      img('1613490493576-7fde63acd811'),
      img('1564013799919-ab600027ffc6'),
      img('1600596542815-ffad4c1539a9'),
      img('1512917774080-9991f1c4c750'),
    ],
    summary: 'Modern kitchen, game room, corner homesite near schools and parks.',
    match_score: 0.8,
    community: 'Falcon Pointe',
  },
  {
    id: 'home-008',
    mls_id: 'MLS-10008',
    address: { line1: '312 Elm Creek Dr', city: 'Buda', state: 'TX', zip: '78610' },
    price_cents: 465_000_00,
    beds: 3,
    baths: 2.5,
    sqft: 2010,
    hero_image_url: img('1600566753086-00f18fb6b3ea'),
    gallery_urls: [
      img('1600607687939-ce8a6c25118c'),
      img('1582268611958-ebfd161ef9cf'),
      img('1615529328331-f8917597711f'),
      img('1616594039964-ae9021a400a0'),
    ],
    summary: 'Modern farmhouse plan, covered patio, energy-efficient HVAC.',
    match_score: 0.83,
    community: 'Elm Creek',
  },
  {
    id: 'home-009',
    mls_id: 'MLS-10009',
    address: { line1: '770 Sailmaster Dr', city: 'Lakeway', state: 'TX', zip: '78734' },
    price_cents: 899_000_00,
    beds: 4,
    baths: 3.5,
    sqft: 3150,
    hero_image_url: img('1564013799919-ab600027ffc6'),
    gallery_urls: [
      img('1613490493576-7fde63acd811'),
      img('1600047509807-ba8f99d2cdde'),
      img('1568605114967-8130f3a36994'),
      img('1600566753086-00f18fb6b3ea'),
    ],
    summary: 'Lake lifestyle community, contemporary finishes, resort-style amenities.',
    match_score: 0.76,
    community: 'Rough Hollow',
  },
  {
    id: 'home-010',
    mls_id: 'MLS-10010',
    address: { line1: '140 Bluebonnet Way', city: 'Manor', state: 'TX', zip: '78653' },
    price_cents: 338_000_00,
    beds: 3,
    baths: 2.0,
    sqft: 1540,
    hero_image_url: img('1568605114967-8130f3a36994'),
    gallery_urls: [
      img('1600585154340-be6161a56a0c'),
      img('1615529328331-f8917597711f'),
      img('1600210492486-724fe5c67fb0'),
      img('1564013799919-ab600027ffc6'),
    ],
    summary: 'New construction, smart thermostat prewire, commuter-friendly to Austin.',
    match_score: 0.74,
    community: 'Shadowglen',
  },
]

/** Mock feeder schools per listing (demo data—not official attendance zones). */
export type NearbySchoolLevel = 'elementary' | 'middle' | 'high'

export type NearbySchool = {
  name: string
  rating: number
  level: NearbySchoolLevel
}

export const NEARBY_SCHOOLS_BY_HOME: Record<string, NearbySchool[]> = {
  'home-001': [
    { name: 'Olmsted Creek Elementary', rating: 8, level: 'elementary' },
    { name: 'South Lamar STEM Elementary', rating: 9, level: 'elementary' },
    { name: 'Barton Springs Middle', rating: 7, level: 'middle' },
    { name: 'Riverside Early College High', rating: 8, level: 'high' },
  ],
  'home-002': [
    { name: 'Live Oak Primary', rating: 7, level: 'elementary' },
    { name: 'Garrison Park Elementary', rating: 8, level: 'elementary' },
    { name: 'Pioneer Trail Middle', rating: 7, level: 'middle' },
    { name: 'Capitol View High', rating: 8, level: 'high' },
  ],
  'home-003': [
    { name: 'Vista Ridge Elementary', rating: 9, level: 'elementary' },
    { name: 'Canyon Creek Elementary', rating: 8, level: 'elementary' },
    { name: 'Walsh Middle', rating: 8, level: 'middle' },
    { name: 'Round Rock Summit High', rating: 9, level: 'high' },
  ],
  'home-004': [
    { name: 'Brushy Creek Elementary', rating: 8, level: 'elementary' },
    { name: 'Forest North Elementary', rating: 7, level: 'elementary' },
    { name: 'Cedar Park Middle', rating: 8, level: 'middle' },
    { name: 'Cypress Ridge High', rating: 8, level: 'high' },
  ],
  'home-005': [
    { name: 'San Gabriel Elementary', rating: 7, level: 'elementary' },
    { name: 'Pecan Grove Elementary', rating: 8, level: 'elementary' },
    { name: 'Georgetown Gateway Middle', rating: 7, level: 'middle' },
    { name: 'San Marcos River High', rating: 8, level: 'high' },
  ],
  'home-006': [
    { name: 'Hill Country Elementary', rating: 8, level: 'elementary' },
    { name: 'Belterra Oaks Elementary', rating: 8, level: 'elementary' },
    { name: 'Dripping Springs Middle', rating: 8, level: 'middle' },
    { name: 'Hill Country Collegiate High', rating: 9, level: 'high' },
  ],
  'home-007': [
    { name: 'Falcon Pointe Elementary', rating: 8, level: 'elementary' },
    { name: 'Brookhollow Elementary', rating: 7, level: 'elementary' },
    { name: 'Park Crest Middle', rating: 7, level: 'middle' },
    { name: 'Pflugerville Heights High', rating: 8, level: 'high' },
  ],
  'home-008': [
    { name: 'Elm Creek Elementary', rating: 8, level: 'elementary' },
    { name: 'Onion Creek Elementary', rating: 7, level: 'elementary' },
    { name: 'Buda Mill Middle', rating: 8, level: 'middle' },
    { name: 'Hays Trail High', rating: 8, level: 'high' },
  ],
  'home-009': [
    { name: 'Rough Hollow Elementary', rating: 9, level: 'elementary' },
    { name: 'Serene Hills Elementary', rating: 8, level: 'elementary' },
    { name: 'Lake Travis Middle', rating: 8, level: 'middle' },
    { name: 'Lake Travis North High', rating: 9, level: 'high' },
  ],
  'home-010': [
    { name: 'Bluebonnet Elementary', rating: 7, level: 'elementary' },
    { name: 'Manor Lakes Elementary', rating: 6, level: 'elementary' },
    { name: 'Manor New Tech Middle', rating: 7, level: 'middle' },
    { name: 'Manor Express High', rating: 7, level: 'high' },
  ],
}

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
  'home-004': [
    {
      id: 'opt-craftsman-trim',
      category: 'exterior',
      label: 'Premium craftsman trim package',
      price_delta_cents: 6_500_00,
    },
  ],
  'home-005': [
    {
      id: 'opt-fence',
      category: 'outdoor',
      label: 'Privacy cedar fence',
      price_delta_cents: 7_200_00,
    },
  ],
  'home-006': [
    {
      id: 'opt-outdoor-kitchen',
      category: 'outdoor',
      label: 'Outdoor kitchen & fire pit',
      price_delta_cents: 28_000_00,
    },
  ],
  'home-007': [
    {
      id: 'opt-media',
      category: 'layout',
      label: 'Pre-wired media room',
      price_delta_cents: 4_800_00,
    },
  ],
  'home-008': [
    {
      id: 'opt-farmhouse-sink',
      category: 'kitchen',
      label: 'Farmhouse sink & faucet upgrade',
      price_delta_cents: 3_200_00,
    },
  ],
  'home-009': [
    {
      id: 'opt-boat-slip',
      category: 'lifestyle',
      label: 'Boat slip access add-on',
      price_delta_cents: 35_000_00,
    },
  ],
  'home-010': [
    {
      id: 'opt-solar-prep',
      category: 'energy',
      label: 'Solar panel prep package',
      price_delta_cents: 5_500_00,
    },
  ],
}
