import { HeartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/FavoritesContext'
import { cn } from '@/lib/utils'

type Props = {
  homeId: string
  className?: string
}

export function FavoriteButton({ homeId, className }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const on = isFavorite(homeId)

  return (
    <Button
      type="button"
      variant={on ? 'default' : 'outline'}
      size="icon"
      className={cn('shrink-0 rounded-full touch-manipulation', className)}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Save to favorites'}
      onClick={() => {
        void toggleFavorite(homeId)
      }}
    >
      <HeartIcon className={cn('h-4 w-4', on && 'fill-current')} />
    </Button>
  )
}
