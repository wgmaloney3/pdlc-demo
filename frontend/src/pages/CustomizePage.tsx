import type { ReactNode } from 'react'
import * as React from 'react'
import { Link, useParams } from 'react-router-dom'

import type { CustomizationOption } from '@/api/types'
import { fetchCustomizationOptions, saveCustomizationSelection } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
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

  const runningTotal = options
    .filter((o) => selected.has(o.id))
    .reduce((s, o) => s + o.price_delta_cents, 0)

  const save = () => {
    if (!homeId) return
    setSaving(true)
    void saveCustomizationSelection(homeId, [...selected])
      .then((r) => setSavedTotal(r.total_price_delta_cents))
      .finally(() => setSaving(false))
  }

  if (loading) return <p className="text-muted-foreground">Loading options…</p>
  if (error || !homeId) return <p className="text-destructive">{error ?? 'Missing home'}</p>
  if (!options.length) {
    return (
      <Empty
        title="No options for this plan"
        action={
          <Button asChild variant="outline">
            <Link to={`/homes/${homeId}`}>Back to home</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 px-0" asChild>
          <Link to={`/homes/${homeId}`}>← Home detail</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Explore options</h1>
        <p className="text-sm text-muted-foreground">
          Step {Math.min(step + 1, totalSteps)} of {totalSteps}. Prices shown reflect selected options.
        </p>
        <ProgressBar value={progress} className="mt-3" />
      </div>

      {step < reviewStep ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium capitalize">{groups[step]?.[0]}</h2>
          <ul className="space-y-3">
            {(groups[step]?.[1] ?? []).map((o) => {
              const on = selected.has(o.id)
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => toggle(o.id)}
                    className={`w-full rounded-lg border p-4 text-left transition hover:bg-muted/80 touch-manipulation ${
                      on ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <div className="font-medium">{o.label}</div>
                    <div className="text-sm text-muted-foreground">
                      +{formatUsdFromCents(o.price_delta_cents)}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p>
              <span className="text-muted-foreground">Options selected:</span>{' '}
              {selected.size ? [...selected].join(', ') : 'None'}
            </p>
            <p className="text-lg font-semibold">
              Running total: {formatUsdFromCents(runningTotal)}
            </p>
            {savedTotal != null ? (
              <p className="text-primary font-medium" role="status">
                Configuration saved. Selected options: {formatUsdFromCents(savedTotal)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < reviewStep ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" disabled={saving} onClick={() => save()}>
            {saving ? 'Saving…' : 'Save configuration'}
          </Button>
        )}
      </div>
    </div>
  )
}

function Empty({ title, action }: { title: string; action: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">{title}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
