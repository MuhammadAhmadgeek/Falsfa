import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // On mount, check localStorage and verify token with /api/auth/me
  useEffect(() => {
    const saved = localStorage.getItem('falsfa_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState({ user: parsed.user, token: parsed.token, isAuthenticated: true, isLoading: false })
        // Verify token is still valid
        api.get('/auth/me').then(res => {
          if (res.data.success) {
            const user = res.data.data
            const authData = { user, token: parsed.token }
            localStorage.setItem('falsfa_auth', JSON.stringify(authData))
            setState(s => ({ ...s, user }))
          }
        }).catch(() => {
          localStorage.removeItem('falsfa_auth')
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
        })
      } catch {
        setState(s => ({ ...s, isLoading: false }))
      }
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.success) {
      const { token, user } = res.data
      const authData = { user, token }
      localStorage.setItem('falsfa_auth', JSON.stringify(authData))
      setState({ user, token, isAuthenticated: true, isLoading: false })
    } else {
      throw new Error(res.data.message || 'Login failed')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('falsfa_auth')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }, [])

  // Demo role switch - re-login as different user
  const switchRole = useCallback(async (role) => {
    const emails = {
      superadmin: 'super@falsfa.com',
      schooladmin: 'admin@greenvalley.edu',
      teacher: 'sarah@greenvalley.edu',
      student: 'ali@greenvalley.edu',
    }
    try {
      await login(emails[role], 'admin123')
    } catch (err) {
      console.error('Role switch failed:', err)
    }
  }, [login])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
