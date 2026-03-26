import { MapPinIcon, RefreshCwIcon } from 'lucide-react'
import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'

import type { BuyerProfile, Home } from '@/api/types'
import { fetchBuyerProfile, runMatching } from '@/api/client'
import { BuyerPreferencesSummary } from '@/components/homes/BuyerPreferencesSummary'
import { PageHeader } from '@/components/common/PageHeader'
import { HomeCard } from '@/components/homes/HomeCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  homePassesQuestionnaireHardFilters,
  maxPriceCentsFromSliderMillions,
  normalizeAnswers,
} from '@/lib/matchScore'
import { formatUsdFromCents } from '@/lib/utils'

type SortKey = 'match' | 'price_asc' | 'price_desc' | 'sqft_desc'

function NoMatchesPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-foreground">No homes match your criteria</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Try raising the max price, showing more communities, or updating your questionnaire so beds, baths, square
        footage, and budget align with available homes.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/questionnaire">Edit questionnaire</Link>
      </Button>
    </div>
  )
}

export default function HomeResultsPage() {
  const location = useLocation()
  const [homes, setHomes] = React.useState<Home[]>([])
  const [profile, setProfile] = React.useState<BuyerProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [communities, setCommunities] = React.useState<string[]>([])
  const [sort, setSort] = React.useState<SortKey>('match')
  const [maxPriceMil, setMaxPriceMil] = React.useState(1)

  const refresh = React.useCallback(() => {
    setLoading(true)
    setError(null)
    void Promise.all([
      fetchBuyerProfile().catch(() => null),
      runMatching(true).catch((e: unknown) => {
        throw e instanceof Error ? e : new Error('Failed to load matches')
      }),
    ])
      .then(([prof, match]) => {
        if (prof) setProfile(prof)
        setHomes(match.homes)
        setCommunities([...new Set(match.homes.map((h) => h.community))].sort())
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load matches'))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh, location.key])

  React.useEffect(() => {
    if (!profile?.questionnaire.completed) return
    const b = normalizeAnswers(profile.questionnaire.answers).budgetMax
    if (b != null) {
      const mil = Math.min(1, Math.max(0.3, b / 1_000_000))
      setMaxPriceMil(mil)
    }
  }, [profile?.updated_at, profile?.questionnaire.completed])

  const questionnairePrefs = React.useMemo(() => {
    if (!profile?.questionnaire.completed) return null
    return normalizeAnswers(profile.questionnaire.answers)
  }, [profile?.questionnaire.completed, profile?.questionnaire.answers, profile?.updated_at])

  const maxCents = maxPriceCentsFromSliderMillions(maxPriceMil)
  const [hiddenCommunities, setHiddenCommunities] = React.useState<Record<string, boolean>>({})

  const filtered = React.useMemo(() => {
    let list = homes.filter((h) => h.price_cents <= maxCents)
    if (questionnairePrefs) {
      list = list.filter((h) => homePassesQuestionnaireHardFilters(h, questionnairePrefs))
    }
    list = list.filter((h) => !hiddenCommunities[h.community])
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sort === 'match') return b.match_score - a.match_score
      if (sort === 'price_asc') return a.price_cents - b.price_cents
      if (sort === 'price_desc') return b.price_cents - a.price_cents
      return b.sqft - a.sqft
    })
    return sorted
  }, [homes, maxCents, hiddenCommunities, sort, questionnairePrefs])

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

  const usesQuestionnaire = Boolean(profile?.questionnaire.completed)

  if (loading && !homes.length) {
    return (
      <div className="space-y-10">
        <div className="space-y-3 border-b border-border/60 pb-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <Skeleton className="h-80 rounded-xl lg:sticky lg:top-24" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Personalized search"
        title="Homes for you"
        description={
          usesQuestionnaire
            ? 'Ranked using your saved questionnaire. Adjust filters below or edit your preferences anytime.'
            : 'Complete your buyer questionnaire so we can rank homes to your budget and style. You can still browse with filters below.'
        }
        actions={
          <Button
            type="button"
            variant="outline"
            size="default"
            className="rounded-full border-border/80 shadow-sm"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            {loading ? 'Refreshing…' : 'Refresh matches'}
          </Button>
        }
      />

      <BuyerPreferencesSummary profile={profile} loading={loading && !profile} />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
        <Card className="h-fit border-border/70 lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Refine results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block text-sm font-medium">Max price</Label>
              <p className="mb-3 text-sm text-muted-foreground">Up to {formatUsdFromCents(maxCents)}</p>
              <Slider
                min={0.3}
                max={1.0}
                step={0.05}
                value={[maxPriceMil]}
                onValueChange={(v) => setMaxPriceMil(v[0] ?? 1)}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Communities</Label>
              <ul className="space-y-2.5">
                {communities.map((c) => (
                  <li key={c} className="flex items-center gap-3">
                    <Checkbox
                      id={`comm-${c}`}
                      checked={!hiddenCommunities[c]}
                      onCheckedChange={(checked) =>
                        setHiddenCommunities((prev) => ({ ...prev, [c]: checked !== true }))
                      }
                    />
                    <Label htmlFor={`comm-${c}`} className="cursor-pointer font-normal leading-snug">
                      {c}
                    </Label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-medium">
                Sort by
              </Label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm sm:h-10"
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
            <TabsList className="mb-1 w-full sm:w-auto">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-6">
              {filtered.length === 0 && homes.length > 0 ? (
                <NoMatchesPlaceholder />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {slice.map((h) => (
                    <HomeCard key={h.id} home={h} layout="grid" />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="list" className="mt-6 space-y-5">
              {filtered.length === 0 && homes.length > 0 ? (
                <NoMatchesPlaceholder />
              ) : (
                slice.map((h) => <HomeCard key={h.id} home={h} layout="list" />)
              )}
            </TabsContent>
            <TabsContent value="map" className="mt-6">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-muted/40 to-muted/20 px-6 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPinIcon className="h-7 w-7" aria-hidden />
                </div>
                <p className="font-display text-lg font-semibold text-foreground">Map view coming soon</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Use grid or list to explore homes. Map view is not available.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <div ref={sentinelRef} className="h-4" aria-hidden />
          {visibleCount < filtered.length ? (
            <p className="mt-6 text-center text-xs font-medium text-muted-foreground">Scroll to load more homes…</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
