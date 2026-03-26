import * as React from 'react'

import type { Home } from '@/api/types'
import { runMatching } from '@/api/client'
import { HomeCard } from '@/components/homes/HomeCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatUsdFromCents } from '@/lib/utils'

type SortKey = 'match' | 'price_asc' | 'price_desc' | 'sqft_desc'

export default function HomeResultsPage() {
  const [homes, setHomes] = React.useState<Home[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [communities, setCommunities] = React.useState<string[]>([])
  const [sort, setSort] = React.useState<SortKey>('match')
  const [maxPriceMil, setMaxPriceMil] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    void runMatching(true)
      .then((r) => {
        setHomes(r.homes)
        setCommunities([...new Set(r.homes.map((h) => h.community))].sort())
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load matches'))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const maxCents = Math.round(maxPriceMil * 1_000_000)
  const [hiddenCommunities, setHiddenCommunities] = React.useState<Record<string, boolean>>({})

  const filtered = React.useMemo(() => {
    let list = homes.filter((h) => h.price_cents <= maxCents)
    list = list.filter((h) => !hiddenCommunities[h.community])
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sort === 'match') return b.match_score - a.match_score
      if (sort === 'price_asc') return a.price_cents - b.price_cents
      if (sort === 'price_desc') return b.price_cents - a.price_cents
      return b.sqft - a.sqft
    })
    return sorted
  }, [homes, maxCents, hiddenCommunities, sort])

  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = React.useState(6)
  React.useEffect(() => {
    setVisibleCount(6)
  }, [filtered.length, maxCents, sort])

  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + 6, filtered.length))
        }
      },
      { rootMargin: '200px' },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [filtered.length])

  const slice = filtered.slice(0, Math.max(visibleCount, 6))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Homes for you</h1>
          <p className="text-sm text-muted-foreground">
            Homes ranked for your preferences. Refine results with filters and sort.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh matches'}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Max price (up to {formatUsdFromCents(maxCents)})</Label>
              <Slider
                min={0.3}
                max={1.0}
                step={0.05}
                value={[maxPriceMil]}
                onValueChange={(v) => setMaxPriceMil(v[0] ?? 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Communities</Label>
              <ul className="space-y-2">
                {communities.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <Checkbox
                      id={`comm-${c}`}
                      checked={!hiddenCommunities[c]}
                      onCheckedChange={(checked) =>
                        setHiddenCommunities((prev) => ({ ...prev, [c]: checked !== true }))
                      }
                    />
                    <Label htmlFor={`comm-${c}`} className="font-normal">
                      {c}
                    </Label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort</Label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm sm:h-9"
              >
                <option value="match">Best match</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="sqft_desc">Largest sqft</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {slice.map((h) => (
                  <HomeCard key={h.id} home={h} layout="grid" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-4 space-y-4">
              {slice.map((h) => (
                <HomeCard key={h.id} home={h} layout="list" />
              ))}
            </TabsContent>
            <TabsContent value="map" className="mt-4">
              <div className="rounded-lg border border-dashed bg-muted/50 px-4 py-16 text-center text-sm text-muted-foreground">
                Map view is not available. Use grid or list to explore homes.
              </div>
            </TabsContent>
          </Tabs>
          <div ref={sentinelRef} className="h-4" aria-hidden />
          {visibleCount < filtered.length ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">Scroll for more…</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}