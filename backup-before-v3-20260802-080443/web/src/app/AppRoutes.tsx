import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import Loader from '../components/common/Loader'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const UsersPage = lazy(() => import('../pages/UsersPage'))
const CampaignsPage = lazy(() => import('../pages/CampaignsPage'))
const TerritoriesPage = lazy(() => import('../pages/TerritoriesPage'))
const MapPage = lazy(() => import('../pages/MapPage'))
const DwellingsPage = lazy(() => import('../pages/DwellingsPage'))
const HouseholdsPage = lazy(() => import('../pages/HouseholdsPage'))
const PersonsPage = lazy(() => import('../pages/PersonsPage'))
const PersonDetailPage = lazy(() => import('../pages/PersonDetailPage'))
const StatisticsPage = lazy(() => import('../pages/StatisticsPage'))
const ReportsPage = lazy(() => import('../pages/ReportsPage'))
const AuditLogsPage = lazy(() => import('../pages/AuditLogsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader label="Chargement de la page…" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/territories" element={<TerritoriesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dwellings" element={<DwellingsPage />} />
            <Route path="/households" element={<HouseholdsPage />} />
            <Route path="/persons" element={<PersonsPage />} />
            <Route path="/persons/:id" element={<PersonDetailPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
