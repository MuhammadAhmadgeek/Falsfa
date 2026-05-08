import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'

const TenantContext = createContext(undefined)

export function TenantProvider({ children }) {
  const { user } = useAuth()

  const tenantId = user?.school?._id || user?.school || null
  const userRole = user?.role || null

  // Build school config from user's populated school object
  const schoolConfig = useMemo(() => {
    if (user?.school && typeof user.school === 'object') {
      return {
        name: user.school.name || 'Falsfa Platform',
        logo: user.school.logo || '',
        code: user.school.code || '',
        primaryColor: '221.2 83.2% 53.3%',
      }
    }
    return { name: 'Falsfa Platform', primaryColor: '221.2 83.2% 53.3%' }
  }, [user])

  // Apply tenant brand color
  useEffect(() => {
    const root = document.documentElement
    if (userRole === 'superadmin') {
      root.style.removeProperty('--primary')
      root.style.removeProperty('--ring')
    }
  }, [userRole])

  const applyTheme = (color) => {
    document.documentElement.style.setProperty('--primary', color)
  }

  const value = useMemo(() => ({
    tenantId,
    schoolConfig,
    userRole,
    applyTheme,
  }), [tenantId, schoolConfig, userRole])

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) throw new Error('useTenant must be used within TenantProvider')
  return context
}
