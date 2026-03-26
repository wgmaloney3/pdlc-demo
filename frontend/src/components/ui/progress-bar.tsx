import { cn } from '@/lib/utils'

type Props = {
  value: number
  className?: string
}

/** Determinate progress bar (0–100). */
export function ProgressBar({ value, className }: Props) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${v}%` }} />
    </div>
  )
}
