import { zodResolver } from '@hookform/resolvers/zod'
import { SearchIcon } from 'lucide-react'
import * as React from 'react'
import { Controller, useForm, type Resolver, type UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { fetchBuyerProfile, updateBuyerProfile } from '@/api/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { formatUsdFromCents } from '@/lib/utils'

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

function QBudgetFields({ form }: { form: UseFormReturn<QuestionnaireValues> }) {
  const { register, formState } = form
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="budgetMax">Max budget (USD)</Label>
        <Input id="budgetMax" type="number" {...register('budgetMax')} />
        {formState.errors.budgetMax ? (
          <p className="text-sm text-destructive">{formState.errors.budgetMax.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredCities">Preferred cities or areas</Label>
        <Input id="preferredCities" {...register('preferredCities')} />
        {formState.errors.preferredCities ? (
          <p className="text-sm text-destructive">{formState.errors.preferredCities.message}</p>
        ) : null}
      </div>
    </div>
  )
}

function QSizeFields({ form }: { form: UseFormReturn<QuestionnaireValues> }) {
  const { register, formState } = form
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="minBeds">Minimum bedrooms</Label>
        <Input id="minBeds" type="number" {...register('minBeds')} />
        {formState.errors.minBeds ? (
          <p className="text-sm text-destructive">{formState.errors.minBeds.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="minBaths">Minimum bathrooms</Label>
        <Input id="minBaths" type="number" step="0.5" {...register('minBaths')} />
        {formState.errors.minBaths ? (
          <p className="text-sm text-destructive">{formState.errors.minBaths.message}</p>
        ) : null}
      </div>
      <div className="space-y-2 sm:col-span-3 md:col-span-1">
        <Label htmlFor="minSqft">Minimum sq ft</Label>
        <Input id="minSqft" type="number" {...register('minSqft')} />
        {formState.errors.minSqft ? (
          <p className="text-sm text-destructive">{formState.errors.minSqft.message}</p>
        ) : null}
      </div>
    </div>
  )
}

function QAccessibilityFields({ form }: { form: UseFormReturn<QuestionnaireValues> }) {
  const { register, control } = form
  return (
    <>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
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
        <Textarea id="accessibilityNotes" {...register('accessibilityNotes')} />
      </div>
    </>
  )
}

function QStyleFields({ form }: { form: UseFormReturn<QuestionnaireValues> }) {
  const { control, formState } = form
  return (
    <div className="space-y-3">
      <Controller
        control={control}
        name="styles"
        render={({ field }) => (
          <ul className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
            {STYLE_OPTIONS.map((s) => {
              const checked = field.value.includes(s)
              return (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`style-${s}`}
                    checked={checked}
                    onCheckedChange={(c) => {
                      if (c === true) field.onChange([...field.value, s])
                      else field.onChange(field.value.filter((x) => x !== s))
                    }}
                  />
                  <Label htmlFor={`style-${s}`} className="flex-1 cursor-pointer font-normal">
                    {s}
                  </Label>
                </li>
              )
            })}
          </ul>
        )}
      />
      {formState.errors.styles ? (
        <p className="text-sm text-destructive">{formState.errors.styles.message}</p>
      ) : null}
    </div>
  )
}

function QuestionnaireFieldsBody({ form }: { form: UseFormReturn<QuestionnaireValues> }) {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Budget &amp; location</h3>
          <p className="mt-1 text-sm text-muted-foreground">What you can spend and where you want to look.</p>
        </div>
        <QBudgetFields form={form} />
      </section>

      <section className="space-y-4 border-t border-border/60 pt-10">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Size</h3>
          <p className="mt-1 text-sm text-muted-foreground">Minimum beds, baths, and square footage.</p>
        </div>
        <QSizeFields form={form} />
      </section>

      <section className="space-y-4 border-t border-border/60 pt-10">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Accessibility</h3>
          <p className="mt-1 text-sm text-muted-foreground">Layout preferences and optional notes.</p>
        </div>
        <QAccessibilityFields form={form} />
      </section>

      <section className="space-y-4 border-t border-border/60 pt-10">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Style</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select all styles you would consider.</p>
        </div>
        <QStyleFields form={form} />
      </section>
    </div>
  )
}

function QuestionnaireSummaryFields({ values }: { values: QuestionnaireValues }) {
  return (
    <dl className="grid gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max budget</dt>
        <dd className="mt-1 font-medium text-foreground">{formatUsdFromCents(Math.round(values.budgetMax * 100))}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Areas</dt>
        <dd className="mt-1 font-medium text-foreground">{values.preferredCities}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bedrooms</dt>
        <dd className="mt-1 font-medium text-foreground">{values.minBeds}+</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bathrooms</dt>
        <dd className="mt-1 font-medium text-foreground">{values.minBaths}+</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Min sq ft</dt>
        <dd className="mt-1 font-medium text-foreground">{values.minSqft.toLocaleString()}+</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Single-story</dt>
        <dd className="mt-1 font-medium text-foreground">{values.singleStory ? 'Yes' : 'No preference'}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Styles</dt>
        <dd className="mt-1 font-medium text-foreground">{values.styles.join(', ')}</dd>
      </div>
      {values.accessibilityNotes.trim() ? (
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</dt>
          <dd className="mt-1 text-foreground">{values.accessibilityNotes}</dd>
        </div>
      ) : null}
    </dl>
  )
}

function formatSavedAt(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return null
  }
}

export default function QuestionnairePage() {
  const { user } = useAuth()
  const [step, setStep] = React.useState(0)
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [doneMsg, setDoneMsg] = React.useState<string | null>(null)
  const [profileSavedCompleted, setProfileSavedCompleted] = React.useState(false)
  const [showWizard, setShowWizard] = React.useState(true)
  const [singleScreenEdit, setSingleScreenEdit] = React.useState(false)
  const [profileUpdatedAt, setProfileUpdatedAt] = React.useState<string | null>(null)

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
        const completed = Boolean(p.questionnaire.completed)
        setProfileSavedCompleted(completed)
        setShowWizard(!completed)
        setSingleScreenEdit(false)
        setProfileUpdatedAt(p.updated_at ?? null)
        setDoneMsg(null)
      })
      .catch(() => {
        if (!cancelled) {
          form.reset(defaults)
          setProfileSavedCompleted(false)
          setShowWizard(true)
          setSingleScreenEdit(false)
          setProfileUpdatedAt(null)
        }
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

  const beginChangeSearch = () => {
    setShowWizard(true)
    setSingleScreenEdit(true)
    setStep(0)
    setDoneMsg(null)
  }

  const cancelEditing = () => {
    setShowWizard(false)
    setSingleScreenEdit(false)
    setStep(0)
    void fetchBuyerProfile()
      .then((p) => {
        const prev = answersFromProfile(p.questionnaire.answers as Record<string, unknown>)
        form.reset({ ...defaults, ...prev })
      })
      .catch(() => {
        form.reset(defaults)
      })
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true)
    setDoneMsg(null)
    try {
      await updateBuyerProfile({
        answers: data as unknown as Record<string, unknown>,
        mark_completed: true,
      })
      const p = await fetchBuyerProfile()
      const prev = answersFromProfile(p.questionnaire.answers as Record<string, unknown>)
      form.reset({ ...defaults, ...prev })
      setProfileSavedCompleted(Boolean(p.questionnaire.completed))
      setProfileUpdatedAt(p.updated_at ?? null)
      setShowWizard(false)
      setSingleScreenEdit(false)
      setDoneMsg('Your preferences have been saved.')
    } finally {
      setSubmitting(false)
    }
  })

  const values = form.watch()
  const progress = ((step + 1) / STEPS.length) * 100
  const savedAtLabel = formatSavedAt(profileUpdatedAt)
  const showSummaryOnly = profileSavedCompleted && !showWizard

  if (loadingProfile) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div className="space-y-3 border-b border-border/60 pb-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (showSummaryOnly) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader
          eyebrow="Saved preferences"
          title="Your home search"
          description={
            savedAtLabel
              ? `Here is what we are using to rank and filter homes. Last updated ${savedAtLabel}.`
              : 'Here is what we are using to rank and filter homes.'
          }
        />

        <Card className="border-border/70 border-primary/20 shadow-md shadow-black/[0.04]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit rounded-full">
                Active search profile
              </Badge>
              <CardTitle className="font-display text-xl">Current selections</CardTitle>
              <CardDescription>
                Go to Homes to see listings matched to these answers, or change your search below.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <QuestionnaireSummaryFields values={values} />
            {doneMsg ? (
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 font-medium text-primary" role="status">
                {doneMsg}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button type="button" className="rounded-full" onClick={beginChangeSearch}>
                <SearchIcon className="h-4 w-4" aria-hidden />
                Change my search
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/homes">Browse matching homes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (singleScreenEdit && profileSavedCompleted) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Edit preferences"
          title="Change your search"
          description="Adjust budget, location, size, accessibility, and style in one place. Save when you are done to refresh your matches."
        />

        <Card className="border-border/70 shadow-md shadow-black/[0.04]">
          <CardHeader>
            <CardTitle className="font-display text-xl">Your criteria</CardTitle>
            <CardDescription>All fields from your buyer questionnaire—no need to step through each screen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <QuestionnaireFieldsBody form={form} />
            <div className="flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full"
                disabled={submitting}
                onClick={() => void onSubmit()}
              >
                {submitting ? 'Saving…' : 'Save profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        eyebrow={`Step ${step + 1} of ${STEPS.length}`}
        title={profileSavedCompleted ? 'Update your search' : 'Buyer questionnaire'}
        description={
          profileSavedCompleted
            ? `${STEPS[step]} — adjust any answers, then save to refresh your matches.`
            : `${STEPS[step]} — we use your answers to rank homes and tailor recommendations.`
        }
      />
      <ProgressBar value={progress} className="-mt-2" />

      <Card className="border-border/70 shadow-md shadow-black/[0.04]">
        <CardHeader>
          <CardTitle className="font-display text-xl">{STEPS[step]}</CardTitle>
          <CardDescription>Your information is used to improve your home matches and recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 0 && <QBudgetFields form={form} />}

          {step === 1 && <QSizeFields form={form} />}

          {step === 2 && <QAccessibilityFields form={form} />}

          {step === 3 && (
            <div className="space-y-3">
              <Label>Styles you like</Label>
              <QStyleFields form={form} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-sm">
              <p className="text-muted-foreground">
                Review your answers. You can edit any section with <strong>Back</strong>.
              </p>
              <QuestionnaireSummaryFields values={values} />
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="rounded-full" onClick={back} disabled={step === 0}>
              Back
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              {profileSavedCompleted ? (
                <Button type="button" variant="ghost" className="rounded-full sm:order-first" onClick={cancelEditing}>
                  Cancel
                </Button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <Button type="button" className="rounded-full" onClick={() => void next()}>
                  Next
                </Button>
              ) : (
                <Button type="button" className="rounded-full" disabled={submitting} onClick={() => void onSubmit()}>
                  {submitting ? 'Saving…' : 'Save profile'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
