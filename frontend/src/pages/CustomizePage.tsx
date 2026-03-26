import type { ReactNode } from 'react'
import * as React from 'react'
import { Link, useParams } from 'react-router-dom'

import type { CustomizationOption } from '@/api/types'
import { fetchCustomizationOptions, saveCustomizationSelection } from '@/api/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUsdFromCents } from '@/lib/utils'

function groupByCategory(options: CustomizationOption[]) {
  const m = new Map<string, CustomizationOption[]>()
  for (const o of options) {
    const list = m.get(o.category) ?? []
    list.push(o)
    m.set(o.category, list)
  }
  return Array.from(m.entries())
}

export default function CustomizePage() {
  const { homeId } = useParams<{ homeId: string }>()
  const [options, setOptions] = React.useState<CustomizationOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [step, setStep] = React.useState(0)
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [saving, setSaving] = React.useState(false)
  const [savedTotal, setSavedTotal] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!homeId) return
    setLoading(true)
    void fetchCustomizationOptions(homeId)
      .then((r) => setOptions(r.options))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load options'))
      .finally(() => setLoading(false))
  }, [homeId])

  const groups = React.useMemo(() => groupByCategory(options), [options])
  const reviewStep = groups.length
  const totalSteps = reviewStep + 1
  const progress = ((step + 1) / totalSteps) * 100

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runningTotal = options.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.price_delta_cents, 0)

  const save = () => {
    if (!homeId) return
    setSaving(true)
    void saveCustomizationSelection(homeId, [...selected])
      .then((r) => setSavedTotal(r.total_price_delta_cents))
      .finally(() => setSaving(false))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <div className="space-y-3 border-b border-border/60 pb-8">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (error || !homeId) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
        <p className="text-destructive">{error ?? 'Missing home'}</p>
      </div>
    )
  }

  if (!options.length) {
    return (
      <Empty
        title="No options for this plan"
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/homes/${homeId}`}>Back to home</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 h-auto rounded-full px-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to={`/homes/${homeId}`}>← Home detail</Link>
        </Button>
        <PageHeader
          eyebrow={`Step ${Math.min(step + 1, totalSteps)} of ${totalSteps}`}
          title="Explore options"
          description="Add upgrades and finishes. Your running total updates as you select items."
        />
        <ProgressBar value={progress} className="mt-4" />
      </div>

      {step < reviewStep ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold capitalize text-foreground">{groups[step]?.[0]}</h2>
          <ul className="space-y-3">
            {(groups[step]?.[1] ?? []).map((o) => {
              const on = selected.has(o.id)
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => toggle(o.id)}
                    className={`w-full rounded-xl border p-4 text-left shadow-sm transition-all touch-manipulation ${
                      on
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/25 shadow-md'
                        : 'border-border/80 bg-card hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="font-semibold text-foreground">{o.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">+{formatUsdFromCents(o.price_delta_cents)}</div>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <Card className="border-border/70 shadow-md shadow-black/[0.04]">
          <CardContent className="space-y-4 pt-8 text-sm">
            <p>
              <span className="text-muted-foreground">Options selected:</span>{' '}
              <span className="font-medium text-foreground">
                {selected.size ? [...selected].join(', ') : 'None'}
              </span>
            </p>
            <p className="font-display text-2xl font-semibold tracking-tight">
              Running total: {formatUsdFromCents(runningTotal)}
            </p>
            {savedTotal != null ? (
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 font-medium text-primary" role="status">
                Configuration saved. Selected options total: {formatUsdFromCents(savedTotal)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" className="rounded-full" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < reviewStep ? (
          <Button type="button" className="rounded-full" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" className="rounded-full" disabled={saving} onClick={() => save()}>
            {saving ? 'Saving…' : 'Save configuration'}
          </Button>
        )}
      </div>
    </div>
  )
}

function Empty({ title, action }: { title: string; action: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-muted/30 to-muted/10 px-8 py-14 text-center shadow-sm">
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      <div className="mt-6">{action}</div>
    </div>
  )
}
