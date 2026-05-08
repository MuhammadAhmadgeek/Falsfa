import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import PrivateRoute from './PrivateRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import StudentList from '@/features/students/StudentList'
import ExamResultEntry from '@/features/examination/ExamResultEntry'
import SuperAdminDashboard from '@/features/super-admin/SuperAdminDashboard'
import UnauthorizedPage from '@/features/auth/UnauthorizedPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard - all roles, but super admin gets their own */}
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
        <Route path="/teachers" element={<PlaceholderPage title="Teachers" />} />
        <Route path="/finance" element={<PlaceholderPage title="Finance" />} />
        <Route path="/my-classes" element={<PlaceholderPage title="My Classes" />} />
        <Route path="/attendance" element={<PlaceholderPage title="Attendance" />} />
        <Route path="/my-results" element={<PlaceholderPage title="My Results" />} />
        <Route path="/fee-status" element={<PlaceholderPage title="Fee Status" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
