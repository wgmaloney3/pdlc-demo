import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'

import { fetchBuyerProfile, updateBuyerProfile } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'

const STYLE_OPTIONS = ['Modern farmhouse', 'Traditional', 'Craftsman', 'Contemporary'] as const

const qSchema = z.object({
  budgetMax: z.coerce.number().min(100_000, 'Enter a budget of at least $100,000'),
  preferredCities: z.string().min(2, 'Add at least one area or city'),
  minBeds: z.coerce.number().int().min(1).max(8),
  minBaths: z.coerce.number().min(1).max(6),
  minSqft: z.coerce.number().min(400, 'Minimum square feet'),
  singleStory: z.boolean(),
  accessibilityNotes: z.string(),
  styles: z.array(z.string()).min(1, 'Pick at least one style'),
})

type QuestionnaireValues = z.infer<typeof qSchema>

const defaults: QuestionnaireValues = {
  budgetMax: 550_000,
  preferredCities: 'Austin, TX',
  minBeds: 3,
  minBaths: 2,
  minSqft: 1_600,
  singleStory: false,
  accessibilityNotes: '',
  styles: ['Modern farmhouse'],
}

const STEPS = ['Budget & location', 'Size', 'Accessibility', 'Style', 'Review'] as const

const stepFieldGroups: (keyof QuestionnaireValues)[][] = [
  ['budgetMax', 'preferredCities'],
  ['minBeds', 'minBaths', 'minSqft'],
  ['singleStory', 'accessibilityNotes'],
  ['styles'],
  [],
]

function answersFromProfile(raw: Record<string, unknown> | undefined): Partial<QuestionnaireValues> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Partial<QuestionnaireValues> = {}
  for (const k of Object.keys(defaults) as (keyof QuestionnaireValues)[]) {
    if (k in raw) {
      const v = raw[k as string]
      if (k === 'styles' && Array.isArray(v)) {
        out.styles = v.filter((x): x is string => typeof x === 'string')
      } else if (k in defaults) {
        ;(out as Record<string, unknown>)[k] = v
      }
    }
  }
  return out
}

export default function QuestionnairePage() {
  const { user } = useAuth()
  const [step, setStep] = React.useState(0)
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [doneMsg, setDoneMsg] = React.useState<string | null>(null)

  const form = useForm<QuestionnaireValues>({
    resolver: zodResolver(qSchema) as Resolver<QuestionnaireValues>,
    defaultValues: defaults,
    mode: 'onChange',
  })

  React.useEffect(() => {
    let cancelled = false
    setLoadingProfile(true)
    void fetchBuyerProfile()
      .then((p) => {
        if (cancelled) return
        const prev = answersFromProfile(p.questionnaire.answers as Record<string, unknown>)
        form.reset({ ...defaults, ...prev })
      })
      .catch(() => {
        if (!cancelled) form.reset(defaults)
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.reset is stable
  }, [user?.user_id])

  const next = async () => {
    if (step >= STEPS.length - 1) return
    const fields = stepFieldGroups[step]
    const ok = fields.length === 0 ? true : await form.trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const back = () => setStep((s) => Math.max(0, s - 1))

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true)
    setDoneMsg(null)
    try {
      await updateBuyerProfile({
        answers: data as unknown as Record<string, unknown>,
        mark_completed: true,
      })
      setDoneMsg('Your preferences have been saved.')
    } finally {
      setSubmitting(false)
    }
  })

  const values = form.watch()
  const progress = ((step + 1) / STEPS.length) * 100

  if (loadingProfile) {
    return <p className="text-muted-foreground">Loading your profile…</p>
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buyer questionnaire</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <ProgressBar value={progress} className="mt-3" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>We use your answers to refine which homes we show you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Max budget (USD)</Label>
                <Input id="budgetMax" type="number" {...form.register('budgetMax')} />
                {form.formState.errors.budgetMax ? (
                  <p className="text-sm text-destructive">{form.formState.errors.budgetMax.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredCities">Preferred cities or areas</Label>
                <Input id="preferredCities" {...form.register('preferredCities')} />
                {form.formState.errors.preferredCities ? (
                  <p className="text-sm text-destructive">{form.formState.errors.preferredCities.message}</p>
                ) : null}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="minBeds">Minimum bedrooms</Label>
                <Input id="minBeds" type="number" {...form.register('minBeds')} />
                {form.formState.errors.minBeds ? (
                  <p className="text-sm text-destructive">{form.formState.errors.minBeds.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minBaths">Minimum bathrooms</Label>
                <Input id="minBaths" type="number" step="0.5" {...form.register('minBaths')} />
                {form.formState.errors.minBaths ? (
                  <p className="text-sm text-destructive">{form.formState.errors.minBaths.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minSqft">Minimum sq ft</Label>
                <Input id="minSqft" type="number" {...form.register('minSqft')} />
                {form.formState.errors.minSqft ? (
                  <p className="text-sm text-destructive">{form.formState.errors.minSqft.message}</p>
                ) : null}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="singleStory"
                  render={({ field }) => (
                    <Checkbox
                      id="singleStory"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  )}
                />
                <Label htmlFor="singleStory">Prefer single-story</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessibilityNotes">Accessibility or mobility notes</Label>
                <Textarea id="accessibilityNotes" {...form.register('accessibilityNotes')} />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label>Styles you like</Label>
              <Controller
                control={form.control}
                name="styles"
                render={({ field }) => (
                  <ul className="space-y-2">
                    {STYLE_OPTIONS.map((s) => {
                      const checked = field.value.includes(s)
                      return (
                        <li key={s} className="flex items-center gap-2">
                          <Checkbox
                            id={`style-${s}`}
                            checked={checked}
                            onCheckedChange={(c) => {
                              if (c === true) field.onChange([...field.value, s])
                              else field.onChange(field.value.filter((x) => x !== s))
                            }}
                          />
                          <Label htmlFor={`style-${s}`} className="font-normal">
                            {s}
                          </Label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              />
              {form.formState.errors.styles ? (
                <p className="text-sm text-destructive">{form.formState.errors.styles.message}</p>
              ) : null}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 text-sm">
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                {JSON.stringify(values, null, 2)}
              </pre>
              {doneMsg ? (
                <p className="text-primary font-medium" role="status">
                  {doneMsg}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => void next()}>
                Next
              </Button>
            ) : (
              <Button type="button" disabled={submitting} onClick={() => void onSubmit()}>
                {submitting ? 'Saving…' : 'Save profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
