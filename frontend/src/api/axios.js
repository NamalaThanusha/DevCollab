import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    // Only redirect to login on 401 if it's NOT the login or register route
    // If we redirect during login, the toast never shows
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api