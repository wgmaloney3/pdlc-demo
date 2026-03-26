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
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full max-w-3xl" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  if (error || !home) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error ?? 'Home not found'}</p>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 px-0" asChild>
            <Link to="/homes">← Back to results</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{home.address.line1}</h1>
          <p className="text-muted-foreground">
            {home.community} · {home.address.city}, {home.address.state} {home.address.zip}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton homeId={home.id} />
          <Button asChild>
            <Link to={`/customize/${home.id}`}>Customize</Link>
          </Button>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full max-w-3xl overflow-hidden rounded-lg border text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={images[imgIndex] ?? home.hero_image_url}
              alt=""
              loading="lazy"
              className="aspect-video w-full object-cover transition group-hover:opacity-95"
            />
            <span className="sr-only">Open photo gallery</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="px-2">
            <DialogTitle className="text-primary-foreground">Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative bg-black/90 p-4">
            <img src={images[imgIndex]} alt="" className="mx-auto max-h-[80svh] w-auto object-contain" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              aria-label="Previous photo"
              onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Next photo"
              onClick={() => setImgIndex((i) => (i + 1) % images.length)}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-xl font-semibold">{formatUsdFromCents(home.price_cents)}</span>
        <Badge variant="secondary">{home.beds} beds</Badge>
        <Badge variant="secondary">{home.baths} baths</Badge>
        <Badge variant="secondary">{home.sqft.toLocaleString()} sqft</Badge>
        <Badge variant="outline">MLS {home.mls_id}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{home.summary}</p>
          {home.description_long ? <p>{home.description_long}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc text-sm">
            {(home.schools ?? []).map((s) => (
              <li key={s.name}>
                {s.name} — rating {s.rating}/10
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </article>
  )
}
