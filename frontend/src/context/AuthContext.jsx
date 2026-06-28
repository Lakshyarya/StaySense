import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(undefined)

const STORAGE_KEY = 'stay-sense-staff-session'

/* Demo credentials — swap with API call once backend auth is wired */
const VALID_CREDENTIALS = { username: 'staff', password: 'staySense2026' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback((username, password) => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const session = { username, role: 'staff', loginAt: new Date().toISOString() }
      setUser(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      return { ok: true }
    }
    return { ok: false, error: 'Invalid username or password.' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
