import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import Loader from '../components/common/Loader'
import AppLayout from '../components/layout/AppLayout'

const HomePage = lazy(() => import('../pages/HomePage'))
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
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
