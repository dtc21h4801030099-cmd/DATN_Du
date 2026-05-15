import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // true only when there's a token that needs server-side validation
  const [isLoading, setIsLoading] = useState(() => !!sessionStorage.getItem('token'))

  useEffect(() => {
    if (!sessionStorage.getItem('token')) return
    api.get('/auth/me')
      .then(({ data }) => {
        sessionStorage.setItem('user', JSON.stringify(data))
        setUser(data)
      })
      .catch(() => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const handleExpired = () => setUser(null)
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = (token, userData) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin', isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
