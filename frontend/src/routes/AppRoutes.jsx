/**
 * AppRoutes.jsx - Main routing configuration for the application.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import PrivateRoute from './PrivateRoute'
import LandingPage from '@/features/landing/LandingPage'
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from '@/features/landing/StaticPages'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import StudentList from '@/features/students/StudentList'
import ExamResultEntry from '@/features/examination/ExamResultEntry'
import SuperAdminDashboard from '@/features/super-admin/SuperAdminDashboard'
import UnauthorizedPage from '@/features/auth/UnauthorizedPage'
import ProfilePage from '@/features/profile/ProfilePage'
import FinancePage from '@/features/finance/FinancePage'
import FeeVoucher from '@/features/finance/FeeVoucher'
import AnalyticsPage from '@/features/analytics/AnalyticsPage'
import SubscriptionsPage from '@/features/subscriptions/SubscriptionsPage'
import TeacherList from '@/features/teachers/TeacherList'
import SchoolSettingsPage from '@/features/settings/SchoolSettingsPage'
import SuperAdminSettingsPage from '@/features/super-admin/SuperAdminSettingsPage'
import TeacherClassesPage from '@/features/classes/TeacherClassesPage'
import ReportsPage from '@/features/reports/ReportsPage'
import AttendancePage from '@/features/attendance/AttendancePage'
import { useAuth } from '@/context/AuthContext'

const SettingsWrapper = () => {
  const { user } = useAuth()
  if (user?.role === 'superadmin') return <SuperAdminSettingsPage />
  return <SchoolSettingsPage />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ──────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Authenticated Routes ───────────────────────────────── */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard - all roles */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Student Management - school admin only */}
        <Route
          path="/students"
          element={
            <PrivateRoute allowedRoles={['schooladmin']}>
              <StudentList />
            </PrivateRoute>
          }
        />

        {/* Examinations - school admin + teacher */}
        <Route
          path="/examinations"
          element={
            <PrivateRoute allowedRoles={['schooladmin', 'teacher']}>
              <ExamResultEntry />
            </PrivateRoute>
          }
        />

        {/* Super Admin routes */}
        <Route
          path="/schools"
          element={
            <PrivateRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Placeholder routes */}
        <Route path="/teachers" element={
          <PrivateRoute allowedRoles={['schooladmin']}>
            <TeacherList />
          </PrivateRoute>
        } />
        <Route path="/finance" element={
          <PrivateRoute allowedRoles={['schooladmin']}>
            <FinancePage />
          </PrivateRoute>
        } />
        <Route path="/finance/voucher/:id" element={
          <PrivateRoute allowedRoles={['schooladmin']}>
            <FeeVoucher />
          </PrivateRoute>
        } />
        <Route path="/my-classes" element={
          <PrivateRoute allowedRoles={['teacher']}>
            <TeacherClassesPage />
          </PrivateRoute>
        } />
        <Route path="/attendance" element={
          <PrivateRoute allowedRoles={['schooladmin', 'teacher']}>
            <AttendancePage />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute allowedRoles={['schooladmin', 'teacher']}>
            <ReportsPage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={
          <PrivateRoute allowedRoles={['schooladmin', 'superadmin']}>
            <SettingsWrapper />
          </PrivateRoute>
        } />
        <Route path="/subscriptions" element={
          <PrivateRoute allowedRoles={['superadmin']}>
            <SubscriptionsPage />
          </PrivateRoute>
        } />

        <Route path="/analytics" element={
          <PrivateRoute allowedRoles={['superadmin']}>
            <AnalyticsPage />
          </PrivateRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
