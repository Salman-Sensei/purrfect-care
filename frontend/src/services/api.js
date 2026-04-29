import axios from 'axios'

const api = axios.create({
  // Use the Vercel environment variable, or fall back to your local server during development
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('purrfect_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle 401 (Unauthorized) globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear local storage and redirect if the token is invalid or expired
      localStorage.removeItem('purrfect_token')
      localStorage.removeItem('purrfect_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api