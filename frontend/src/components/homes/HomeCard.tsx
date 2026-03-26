import { Link } from 'react-router-dom'

import type { Home } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatUsdFromCents } from '@/lib/utils'

import { FavoriteButton } from './FavoriteButton'

type Props = {
  home: Home
  layout?: 'grid' | 'list'
}

export function HomeCard({ home, layout = 'grid' }: Props) {
  const isList = layout === 'list'

  return (
    <Card className="group overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.06]">
      <CardContent className={isList ? 'flex gap-0 p-0 sm:flex-row' : 'p-0'}>
        <Link
          to={`/homes/${home.id}`}
          className={isList ? 'relative w-full shrink-0 overflow-hidden sm:w-64' : 'relative block overflow-hidden'}
        >
          <img
            src={home.hero_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className={
              isList
                ? 'aspect-video w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03] sm:aspect-square sm:h-full sm:min-h-[11rem]'
                : 'aspect-[4/3] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03] sm:aspect-video'
            }
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"
            aria-hidden
          />
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <Link
                to={`/homes/${home.id}`}
                className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {home.address.line1}
              </Link>
              <p className="text-sm text-muted-foreground">
                {home.community} · {home.address.city}, {home.address.state}
              </p>
            </div>
            <FavoriteButton homeId={home.id} />
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{home.summary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-foreground">{formatUsdFromCents(home.price_cents)}</span>
            <Badge variant="secondary" className="font-normal">
              {home.beds} bd
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {home.baths} ba
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {home.sqft.toLocaleString()} sqft
            </Badge>
            <Badge variant="outline" className="border-emerald-200/90 bg-emerald-50/90 font-medium text-emerald-900">
              {(home.match_score * 100).toFixed(0)}% match
            </Badge>
          </div>
          <Link
            to={`/customize/${home.id}`}
            className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Explore customization options →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
