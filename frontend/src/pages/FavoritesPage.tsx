import * as React from 'react'
import { Link } from 'react-router-dom'

import { compareHomes } from '@/api/client'
import { EmptyState } from '@/components/common/EmptyState'
import { HomeCard } from '@/components/homes/HomeCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
    return <p className="text-muted-foreground">Loading favorites…</p>
  }

  if (!favorites.length) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Save homes from results or detail pages to compare them here."
      >
        <Button asChild>
          <Link to="/homes">Browse homes</Link>
        </Button>
      </EmptyState>
    )
  }

  const attrs = ['community', 'price', 'beds', 'baths', 'sqft', 'match'] as const

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
          <p className="text-sm text-muted-foreground">
            Select up to {COMPARE_MAX} homes to compare side by side.
          </p>
        </div>
        <Button
          type="button"
          disabled={selected.length < 2 || compareLoading}
          onClick={() => runCompare()}
        >
          {compareLoading ? 'Loading…' : 'Compare selected'}
        </Button>
      </div>

      <div className="space-y-4">
        {favorites.map((h) => (
          <div key={h.id} className="flex gap-3">
            <div className="flex items-start pt-4">
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
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle className="text-base">Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium">Attribute</th>
                  {compareRows.map((h) => (
                    <th key={h.id} className="py-2 pr-4 font-normal">
                      <Link to={`/homes/${h.id}`} className="text-primary hover:underline">
                        {h.address.line1}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attrs.map((attr) => (
                  <tr key={attr} className="border-b last:border-0">
                    <td className="py-2 pr-4 capitalize text-muted-foreground">{attr}</td>
                    {compareRows.map((h) => (
                      <td key={h.id + attr} className="py-2 pr-4">
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
