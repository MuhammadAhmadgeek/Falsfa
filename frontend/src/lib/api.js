import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('falsfa_auth')
  if (saved) {
    try {
      const { token } = JSON.parse(saved)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      console.warn('Failed to parse auth token from localStorage')
    }
  }
  return config
})

// Handle 401 errors globally (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('falsfa_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
