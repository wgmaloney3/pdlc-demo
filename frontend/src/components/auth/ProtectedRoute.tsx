import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'

function ProtectedRouteInner() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function ProtectedRoute() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 p-6">
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <ProtectedRouteInner />
    </Suspense>
  )
}
