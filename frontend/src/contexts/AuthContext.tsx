import * as React from 'react'

import type { AuthMe } from '@/api/types'
import { fetchMe, getStoredToken, login as apiLogin, logout as apiLogout, setStoredToken } from '@/api/client'

type AuthState = {
  user: AuthMe | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthMe | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      setUser(null)
      setStoredToken(null)
    }
  }, [])

  React.useEffect(() => {
    void refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = React.useCallback(async (email: string, password: string) => {
    await apiLogin(email, password)
    await refresh()
  }, [refresh])

  const logout = React.useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const value = React.useMemo(
    () => ({ user, loading, refresh, login, logout }),
    [user, loading, refresh, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
