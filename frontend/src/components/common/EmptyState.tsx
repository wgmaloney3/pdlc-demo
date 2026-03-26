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
        'flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-12 text-center',
        className,
      )}
    >
      <h2 id="empty-title" className="text-lg font-semibold">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground" aria-describedby="empty-title">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}
