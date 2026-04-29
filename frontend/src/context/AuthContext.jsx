import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('purrfect_user') || 'null'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('purrfect_token')
    if (!token) { setLoading(false); return }

    authService.getMe()
      .then(({ data }) => setUser(data))
      .catch(() => { logout() })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password })
    localStorage.setItem('purrfect_token', data.token)
    localStorage.setItem('purrfect_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
    setUser({ _id: data._id, name: data.name, email: data.email })
    return data
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const { data } = await authService.signup({ name, email, password })
    localStorage.setItem('purrfect_token', data.token)
    localStorage.setItem('purrfect_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
    setUser({ _id: data._id, name: data.name, email: data.email })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('purrfect_token')
    localStorage.removeItem('purrfect_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
