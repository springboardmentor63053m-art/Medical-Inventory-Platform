import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount, restore user from localStorage
  useEffect(() => {
    const storedUser  = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const data = res.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify({
      id:       data.userId,
      username: data.username,
      email:    data.email,
      role:     data.role,
    }))
    setToken(data.token)
    setUser({ id: data.userId, username: data.username, email: data.email, role: data.role })
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const res = await axiosInstance.post('/auth/register', payload)
    const data = res.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify({
      id:       data.userId,
      username: data.username,
      email:    data.email,
      role:     data.role,
    }))
    setToken(data.token)
    setUser({ id: data.userId, username: data.username, email: data.email, role: data.role })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((roles) => {
    if (!user) return false
    return Array.isArray(roles)
      ? roles.includes(user.role)
      : user.role === roles
  }, [user])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
