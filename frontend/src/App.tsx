import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/skeleton'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const HomeResultsPage = lazy(() => import('@/pages/HomeResultsPage'))
const HomeDetailPage = lazy(() => import('@/pages/HomeDetailPage'))
const QuestionnairePage = lazy(() => import('@/pages/QuestionnairePage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const CustomizePage = lazy(() => import('@/pages/CustomizePage'))

function PageFallback() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageFallback />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageFallback />}>
              <RegisterPage />
            </Suspense>
          }
        />
        <Route path="/" element={<Navigate to="/questionnaire" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="homes"
              element={
                <Suspense fallback={<PageFallback />}>
                  <HomeResultsPage />
                </Suspense>
              }
            />
            <Route
              path="homes/:homeId"
              element={
                <Suspense fallback={<PageFallback />}>
                  <HomeDetailPage />
                </Suspense>
              }
            />
            <Route
              path="questionnaire"
              element={
                <Suspense fallback={<PageFallback />}>
                  <QuestionnairePage />
                </Suspense>
              }
            />
            <Route
              path="favorites"
              element={
                <Suspense fallback={<PageFallback />}>
                  <FavoritesPage />
                </Suspense>
              }
            />
            <Route
              path="customize/:homeId"
              element={
                <Suspense fallback={<PageFallback />}>
                  <CustomizePage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/questionnaire" replace />} />
      </Routes>
    </Suspense>
  )
}
