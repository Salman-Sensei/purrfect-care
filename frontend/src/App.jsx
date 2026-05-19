import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import LandingPage       from './pages/LandingPage'
import AuthPage          from './pages/AuthPage'
import DashboardPage     from './pages/DashboardPage'
import CatsPage          from './pages/CatsPage'
import CatProfilePage    from './pages/CatProfilePage'
import ChecklistPage     from './pages/ChecklistPage'
import VetRecordsPage    from './pages/VetRecordsPage'
import SymptomHelperPage from './pages/SymptomHelperPage'
import ProductRecommendationsPage from './pages/ProductRecommendationsPage'
import SharedCatPage from './pages/SharedCatPage'

function RootRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
            Loading Purrfect Care...
          </p>
        </div>
      </div>
    )
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return (
    <div className="landing-root">
      <LandingPage />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/"       element={<RootRoute />} />
              <Route path="/login"  element={<div className="landing-root"><AuthPage /></div>} />
              <Route path="/signup" element={<div className="landing-root"><AuthPage /></div>} />
              <Route path="/share/:token" element={<SharedCatPage />} />

              <Route path="/" element={
                <ProtectedRoute><Layout /></ProtectedRoute>
              }>
                <Route path="dashboard"  element={<DashboardPage />} />
                <Route path="cats"       element={<CatsPage />} />
                <Route path="cats/:id"   element={<CatProfilePage />} />
                <Route path="checklist"  element={<ChecklistPage />} />
                <Route path="vet"        element={<VetRecordsPage />} />
                <Route path="symptoms"   element={<SymptomHelperPage />} />
                <Route path="products"   element={<ProductRecommendationsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
