import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { Home } from '@/api/types'
import { fetchHome } from '@/api/client'
import { FavoriteButton } from '@/components/homes/FavoriteButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUsdFromCents } from '@/lib/utils'

export default function HomeDetailPage() {
  const { homeId } = useParams<{ homeId: string }>()
  const navigate = useNavigate()
  const [home, setHome] = React.useState<Home | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [imgIndex, setImgIndex] = React.useState(0)

  React.useEffect(() => {
    if (!homeId) return
    setLoading(true)
    void fetchHome(homeId)
      .then(setHome)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [homeId])

  const images = React.useMemo(() => {
    if (!home) return []
    const g = home.gallery_urls?.length ? home.gallery_urls : []
    return [home.hero_image_url, ...g].filter(Boolean)
  }, [home])

  React.useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setImgIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setImgIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, images.length])

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="aspect-[21/9] w-full max-w-4xl rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    )
  }

  if (error || !home) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card px-6 py-12 text-center shadow-sm">
        <p className="text-destructive">{error ?? 'Home not found'}</p>
        <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <article className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Button variant="ghost" size="sm" className="-ml-2 h-auto rounded-full px-2 text-muted-foreground hover:text-foreground" asChild>
            <Link to="/homes" className="gap-1">
              <span aria-hidden>←</span> Back to results
            </Link>
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">{home.community}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {home.address.line1}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {home.address.city}, {home.address.state} {home.address.zip}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FavoriteButton homeId={home.id} />
          <Button asChild className="rounded-full px-6">
            <Link to={`/customize/${home.id}`}>Customize this home</Link>
          </Button>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-muted/20 text-left shadow-lg shadow-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img
              src={images[imgIndex] ?? home.hero_image_url}
              alt=""
              loading="lazy"
              className="aspect-[21/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
            <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
              View gallery
            </span>
            <span className="sr-only">Open photo gallery</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="px-2">
            <DialogTitle className="text-primary-foreground">Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative rounded-2xl bg-black/90 p-4">
            <img src={images[imgIndex]} alt="" className="mx-auto max-h-[80svh] w-auto object-contain" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
              aria-label="Previous photo"
              onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              aria-label="Next photo"
              onClick={() => setImgIndex((i) => (i + 1) % images.length)}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-baseline gap-3 border-b border-border/60 pb-8">
        <span className="font-display text-3xl font-semibold tracking-tight">{formatUsdFromCents(home.price_cents)}</span>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-normal">
            {home.beds} beds
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-normal">
            {home.baths} baths
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-normal">
            {home.sqft.toLocaleString()} sqft
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 font-normal">
            MLS {home.mls_id}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>{home.summary}</p>
            {home.description_long ? <p>{home.description_long}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl">Schools nearby</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {(home.schools ?? []).map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                >
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="shrink-0 text-muted-foreground">Rating {s.rating}/10</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </article>
  )
}
