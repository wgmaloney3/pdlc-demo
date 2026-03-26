import * as React from 'react'

import type { Home } from '@/api/types'
import {
  addFavoriteApi,
  fetchFavorites,
  removeFavoriteApi,
} from '@/api/client'

import { useAuth } from './AuthContext'

type FavoritesState = {
  favorites: Home[]
  favoriteIds: ReadonlySet<string>
  loading: boolean
  refresh: () => Promise<void>
  toggleFavorite: (homeId: string) => Promise<void>
  isFavorite: (homeId: string) => boolean
}

const FavoritesContext = React.createContext<FavoritesState | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = React.useState<Home[]>([])
  const [loading, setLoading] = React.useState(false)

  const favoriteIds = React.useMemo(() => new Set(favorites.map((h) => h.id)), [favorites])

  const refresh = React.useCallback(async () => {
    if (!user) {
      setFavorites([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchFavorites()
      setFavorites(data.items)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const toggleFavorite = React.useCallback(
    async (homeId: string) => {
      if (!user) return
      if (favoriteIds.has(homeId)) {
        await removeFavoriteApi(homeId)
      } else {
        await addFavoriteApi(homeId)
      }
      await refresh()
    },
    [user, favoriteIds, refresh],
  )

  const isFavorite = React.useCallback((homeId: string) => favoriteIds.has(homeId), [favoriteIds])

  const value = React.useMemo(
    () => ({ favorites, favoriteIds, loading, refresh, toggleFavorite, isFavorite }),
    [favorites, favoriteIds, loading, refresh, toggleFavorite, isFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites(): FavoritesState {
  const ctx = React.useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}
