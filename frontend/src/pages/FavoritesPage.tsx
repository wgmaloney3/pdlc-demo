import * as React from 'react'
import { Link } from 'react-router-dom'

import { compareHomes } from '@/api/client'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { HomeCard } from '@/components/homes/HomeCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { formatUsdFromCents } from '@/lib/utils'

const COMPARE_MAX = 3

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites()
  const [selected, setSelected] = React.useState<string[]>([])
  const [compareLoading, setCompareLoading] = React.useState(false)
  const [compareRows, setCompareRows] = React.useState<Awaited<ReturnType<typeof compareHomes>>['homes']>([])

  const toggleCompare = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= COMPARE_MAX) return prev
      return [...prev, id]
    })
  }

  const runCompare = () => {
    if (selected.length < 2) return
    setCompareLoading(true)
    void compareHomes(selected)
      .then((r) => setCompareRows(r.homes))
      .finally(() => setCompareLoading(false))
  }

  React.useEffect(() => {
    setCompareRows([])
  }, [selected])

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="space-y-3 border-b border-border/60 pb-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!favorites.length) {
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="Saved homes"
          title="Favorites"
          description="Keep track of plans you love and compare them side by side."
        />
        <EmptyState
          title="No favorites yet"
          description="Tap the heart on any home to save it here. You can compare up to three homes at once."
        >
          <Button asChild className="rounded-full px-8">
            <Link to="/homes">Browse homes</Link>
          </Button>
        </EmptyState>
      </div>
    )
  }

  const attrs = ['community', 'price', 'beds', 'baths', 'sqft', 'match'] as const

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Saved homes"
        title="Favorites"
        description={`Select up to ${COMPARE_MAX} homes to compare price, size, and match scores.`}
        actions={
          <Button
            type="button"
            className="rounded-full"
            disabled={selected.length < 2 || compareLoading}
            onClick={() => runCompare()}
          >
            {compareLoading ? 'Loading…' : 'Compare selected'}
          </Button>
        }
      />

      <div className="space-y-6">
        {favorites.map((h) => (
          <div key={h.id} className="flex gap-4">
            <div className="flex items-start pt-5 sm:pt-6">
              <Checkbox
                id={`cmp-${h.id}`}
                checked={selected.includes(h.id)}
                onCheckedChange={() => toggleCompare(h.id)}
                disabled={!selected.includes(h.id) && selected.length >= COMPARE_MAX}
                aria-label={`Compare ${h.address.line1}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <HomeCard home={h} layout="list" />
            </div>
          </div>
        ))}
      </div>

      {compareRows.length >= 2 ? (
        <Card className="overflow-x-auto border-border/70 shadow-md shadow-black/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-xl">Side-by-side comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  <th className="py-3 pr-4 font-semibold text-foreground">Attribute</th>
                  {compareRows.map((h) => (
                    <th key={h.id} className="py-3 pr-4 font-normal">
                      <Link to={`/homes/${h.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                        {h.address.line1}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attrs.map((attr) => (
                  <tr key={attr} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium capitalize text-muted-foreground">{attr}</td>
                    {compareRows.map((h) => (
                      <td key={h.id + attr} className="py-3 pr-4 text-foreground">
                        {attr === 'price'
                          ? formatUsdFromCents(h.price_cents)
                          : attr === 'beds'
                            ? h.beds
                            : attr === 'baths'
                              ? h.baths
                              : attr === 'sqft'
                                ? h.sqft.toLocaleString()
                                : attr === 'match'
                                  ? `${(h.match_score * 100).toFixed(0)}%`
                                  : h.community}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
