import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import AppRoutes from '@/routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppRoutes />
      </TenantProvider>
    </AuthProvider>
  )
}

export default App
