import { ClipboardListIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { BuyerProfile } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeAnswers } from '@/lib/matchScore'
import { formatUsdFromCents } from '@/lib/utils'

type Props = {
  profile: BuyerProfile | null
  loading?: boolean
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground sm:text-base">{value}</dd>
    </div>
  )
}

export function BuyerPreferencesSummary({ profile, loading }: Props) {
  if (loading) {
    return (
      <Card className="border-border/70 border-primary/15 bg-gradient-to-br from-primary/[0.04] to-transparent">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    if (loading) return null
    return (
      <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-lg">Your buyer profile</CardTitle>
            <CardDescription className="text-base">
              Complete the questionnaire so we can rank homes using your preferences.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full shrink-0 rounded-full border-primary/25 sm:w-auto">
            <Link to="/questionnaire">
              <ClipboardListIcon className="h-4 w-4" aria-hidden />
              Complete questionnaire
            </Link>
          </Button>
        </CardHeader>
      </Card>
    )
  }

  const { completed, answers: raw } = profile.questionnaire
  const q = normalizeAnswers(raw)

  const editButton = (
    <Button asChild variant="outline" className="w-full shrink-0 rounded-full border-primary/25 sm:w-auto">
      <Link to="/questionnaire">
        <ClipboardListIcon className="h-4 w-4" aria-hidden />
        {completed ? 'Edit questionnaire' : 'Complete questionnaire'}
      </Link>
    </Button>
  )

  if (!completed) {
    return (
      <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-display text-lg">Your buyer profile</CardTitle>
            <CardDescription className="text-base">
              Finish the questionnaire so we can rank homes using your budget, size, and style preferences.
            </CardDescription>
          </div>
          {editButton}
        </CardHeader>
      </Card>
    )
  }

  const budget =
    q.budgetMax != null
      ? formatUsdFromCents(Math.round(q.budgetMax * 100))
      : '—'
  const location = q.preferredCities?.trim() || '—'
  const beds = q.minBeds != null ? `${q.minBeds}+ bedrooms` : '—'
  const baths = q.minBaths != null ? `${q.minBaths}+ bathrooms` : '—'
  const sqft = q.minSqft != null ? `${q.minSqft.toLocaleString()}+ sq ft` : '—'
  const story =
    q.singleStory === true ? 'Prefer single-story' : q.singleStory === false ? 'No single-story preference' : '—'
  const notes = q.accessibilityNotes?.trim()

  return (
    <Card className="border-border/70 border-primary/15 bg-gradient-to-br from-primary/[0.05] to-card">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="font-display text-xl">Your preferences</CardTitle>
          <CardDescription>Matches on this page use these answers when you refresh results.</CardDescription>
        </div>
        {editButton}
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Row label="Max budget" value={budget} />
          <Row label="Areas" value={location} />
          <Row label="Bedrooms" value={beds} />
          <Row label="Bathrooms" value={baths} />
          <Row label="Size" value={sqft} />
          <Row label="Layout" value={story} />
        </dl>
        {(q.styles?.length ?? 0) > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Styles</p>
            <div className="flex flex-wrap gap-2">
              {q.styles!.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full px-3 py-1 font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {notes ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Accessibility & notes</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
