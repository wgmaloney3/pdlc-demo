import * as React from 'react'

import type { AuthMe } from '@/api/types'
import {
  ApiError,
  AUTH_ME_CACHE_KEY,
  fetchMe,
  getStoredToken,
  login as apiLogin,
  logout as apiLogout,
  setStoredToken,
} from '@/api/client'
import { useNavigate } from 'react-router-dom'

function readCachedAuthMe(): AuthMe | null {
  try {
    const raw = sessionStorage.getItem(AUTH_ME_CACHE_KEY)
    if (!raw) return null
    const me = JSON.parse(raw) as AuthMe
    if (me && typeof me.user_id === 'string' && typeof me.email === 'string') return me
  } catch {
    /* ignore */
  }
  return null
}

function writeCachedAuthMe(me: AuthMe | null) {
  try {
    if (!me) sessionStorage.removeItem(AUTH_ME_CACHE_KEY)
    else sessionStorage.setItem(AUTH_ME_CACHE_KEY, JSON.stringify(me))
  } catch {
    /* ignore */
  }
}

type AuthState = {
  user: AuthMe | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<AuthMe | null>(null)
  const [loading, setLoading] = React.useState(true)
  const userRef = React.useRef<AuthMe | null>(null)
  userRef.current = user

  const refresh = React.useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null)
      writeCachedAuthMe(null)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
      writeCachedAuthMe(me)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setStoredToken(null)
        writeCachedAuthMe(null)
        setUser(null)
        return
      }
      if (userRef.current != null) {
        return
      }
      const cached = readCachedAuthMe()
      if (cached) {
        setUser(cached)
        return
      }
      setStoredToken(null)
      writeCachedAuthMe(null)
      setUser(null)
    }
  }, [])

  React.useEffect(() => {
    const onExpired = () => {
      setUser(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener('clayton-auth-expired', onExpired)
    return () => window.removeEventListener('clayton-auth-expired', onExpired)
  }, [navigate])

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
    writeCachedAuthMe(null)
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
