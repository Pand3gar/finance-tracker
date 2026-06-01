import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Layout from '@/components/Layout'

// Lazy-loaded routes — each page (and its deps, e.g. recharts on Reports)
// ships as a separate chunk fetched on demand instead of in the initial bundle.
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const AccountsPage = lazy(() => import('@/pages/AccountsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))

function PageFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bail out early if Supabase isn't configured
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout)
        setSession(session)
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {/* Dev banner when Supabase is not configured */}
      {!isSupabaseConfigured && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 px-4 py-2 text-center text-sm font-medium text-black backdrop-blur-sm">
          ⚠️ Supabase not configured — update <code className="rounded bg-black/10 px-1">.env</code> with real credentials to enable auth
        </div>
      )}
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/login"
              element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            {session ? (
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
