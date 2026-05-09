import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import PrivateRoute from './PrivateRoute'
import LandingPage from '@/features/landing/LandingPage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import StudentList from '@/features/students/StudentList'
import ExamResultEntry from '@/features/examination/ExamResultEntry'
import SuperAdminDashboard from '@/features/super-admin/SuperAdminDashboard'
import UnauthorizedPage from '@/features/auth/UnauthorizedPage'
import AttendanceEntry from '@/features/attendance/AttendanceEntry'
import TeacherList from '@/features/teachers/TeacherList'
import MyResults from '@/features/examination/MyResults'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ──────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
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

        {/* Teachers - school admin */}
        <Route
          path="/teachers"
          element={
            <PrivateRoute allowedRoles={['schooladmin']}>
              <TeacherList />
            </PrivateRoute>
          }
        />

        {/* Attendance - teacher + school admin */}
        <Route
          path="/attendance"
          element={
            <PrivateRoute allowedRoles={['schooladmin', 'teacher']}>
              <AttendanceEntry />
            </PrivateRoute>
          }
        />

        {/* My Results - student only */}
        <Route
          path="/my-results"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <MyResults />
            </PrivateRoute>
          }
        />

        {/* Placeholder routes for remaining modules */}
        <Route path="/finance" element={<PlaceholderPage title="Finance" />} />
        <Route path="/my-classes" element={<PlaceholderPage title="My Classes" />} />
        <Route path="/fee-status" element={<PlaceholderPage title="Fee Status" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">This module is coming soon.</p>
    </div>
  )
}
