import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function EmptyState({ title, description, children, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-card to-muted/30 px-6 py-16 text-center shadow-sm shadow-black/[0.02]',
        className,
      )}
    >
      <h2 id="empty-title" className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground" aria-describedby="empty-title">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  )
}
