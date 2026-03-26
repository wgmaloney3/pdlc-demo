import { HomeIcon, SparklesIcon, ShieldCheckIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Wider form column on large screens (e.g. sign-in) */
  contentClassName?: string
}

const highlights = [
  { icon: SparklesIcon, text: 'Homes matched to your lifestyle and budget' },
  { icon: HomeIcon, text: 'Browse plans, save favorites, and compare options' },
  { icon: ShieldCheckIcon, text: 'Secure sign-in — your preferences stay private' },
]

export function AuthShell({ children, className, contentClassName }: Props) {
  return (
    <div className={cn('relative min-h-svh overflow-hidden bg-background', className)}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(at 40% 20%, rgb(30 58 95 / 0.12) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgb(45 90 120 / 0.1) 0px, transparent 45%),
            radial-gradient(at 0% 50%, rgb(30 58 95 / 0.08) 0px, transparent 40%)`,
        }}
      />
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary px-12 py-14 text-primary-foreground xl:px-16 xl:py-16 lg:flex">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/20 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-lg text-xl font-semibold tracking-tight xl:text-2xl"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 xl:h-12 xl:w-12">
                <HomeIcon className="h-6 w-6 xl:h-6 xl:w-6" aria-hidden />
              </span>
              Clayton Homes
            </Link>
            <p className="max-w-md text-base leading-relaxed text-primary-foreground/85 xl:text-lg xl:leading-relaxed">
              Find and personalize your next home with guided matching and transparent options.
            </p>
          </div>
          <ul className="relative z-10 space-y-6">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 xl:h-11 xl:w-11">
                  <Icon className="h-5 w-5 opacity-95 xl:h-5 xl:w-5" aria-hidden />
                </span>
                <span className="text-base leading-snug text-primary-foreground/90 xl:text-lg xl:leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-20">
          <div className={cn('mx-auto w-full max-w-md', contentClassName)}>
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <HomeIcon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">Clayton Homes</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
