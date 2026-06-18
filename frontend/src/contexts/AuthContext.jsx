import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, saveUser, logout as authLogout, fetchMe } from '../lib/auth'
import { getToken, setToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (getToken()) {
      fetchMe()
        .then((u) => {
          setUser(u)
          saveUser(u)
        })
        .catch(() => {
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setUser(getCurrentUser())
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    setToken(token)
    saveUser(userData)
    setUser(userData)
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

    const updateUser = (data) => {
    saveUser(data)
    setUser(data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
