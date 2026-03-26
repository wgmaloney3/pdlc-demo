import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  return (
    <AuthShell contentClassName="lg:max-w-xl xl:max-w-2xl">
      <Card className="border-0 shadow-xl shadow-black/10 ring-1 ring-border/60">
        <CardHeader className="space-y-2 pb-3 sm:space-y-3 sm:pb-4 lg:px-8 lg:pb-6 lg:pt-8">
          <CardTitle className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-4xl xl:text-5xl xl:leading-[1.1]">
            Create your account
          </CardTitle>
          <CardDescription className="text-base leading-relaxed sm:text-lg lg:text-xl lg:leading-relaxed">
            Save favorites, complete your buyer profile, and get better home matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="lg:px-8 lg:pb-8">
          <form
            className="space-y-5 sm:space-y-6 lg:space-y-8"
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              setPending(true)
              void login(email, password)
                .then(() => navigate('/questionnaire', { replace: true }))
                .catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : 'Registration failed')
                })
                .finally(() => setPending(false))
            }}
          >
            <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
              <Label htmlFor="reg-email" className="text-sm font-medium sm:text-base lg:text-lg">
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-lg text-base sm:h-12 lg:h-14 lg:rounded-xl lg:px-4 lg:text-lg"
              />
            </div>
            <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
              <Label htmlFor="reg-password" className="text-sm font-medium sm:text-base lg:text-lg">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg text-base sm:h-12 lg:h-14 lg:rounded-xl lg:px-4 lg:text-lg"
              />
            </div>
            {error ? (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive sm:text-base lg:px-4 lg:py-3 lg:text-lg"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="h-12 w-full rounded-lg text-base sm:h-12 lg:h-14 lg:rounded-xl lg:text-lg xl:h-16 xl:text-xl"
              disabled={pending}
            >
              {pending ? 'Creating…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground sm:mt-8 sm:text-base lg:mt-10 lg:text-lg">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
