import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Home } from '@/api/types'
import { formatUsdFromCents } from '@/lib/utils'

import { FavoriteButton } from './FavoriteButton'

type Props = {
  home: Home
  layout?: 'grid' | 'list'
}

export function HomeCard({ home, layout = 'grid' }: Props) {
  const isList = layout === 'list'

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className={isList ? 'flex gap-4 p-0 sm:flex-row' : 'p-0'}>
        <Link
          to={`/homes/${home.id}`}
          className={isList ? 'relative w-full shrink-0 sm:w-56' : 'block'}
        >
          <img
            src={home.hero_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className={isList ? 'aspect-video w-full object-cover sm:aspect-square sm:h-full' : 'aspect-video w-full object-cover'}
          />
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/homes/${home.id}`} className="font-semibold leading-tight hover:underline">
                {home.address.line1}
              </Link>
              <p className="text-sm text-muted-foreground">
                {home.community} · {home.address.city}, {home.address.state}
              </p>
            </div>
            <FavoriteButton homeId={home.id} />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{home.summary}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{formatUsdFromCents(home.price_cents)}</span>
            <Badge variant="secondary">{home.beds} bd</Badge>
            <Badge variant="secondary">{home.baths} ba</Badge>
            <Badge variant="secondary">{home.sqft.toLocaleString()} sqft</Badge>
            <Badge variant="outline">Match {(home.match_score * 100).toFixed(0)}%</Badge>
          </div>
          <Link
            to={`/customize/${home.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Explore options
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
