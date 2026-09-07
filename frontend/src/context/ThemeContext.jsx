import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'medinv-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system'
  })
  const [resolved, setResolved] = useState(() => resolveTheme(theme))

  useEffect(() => {
    const next = resolveTheme(theme)
    setResolved(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const next = getSystemTheme()
      setResolved(next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.setAttribute('data-theme', next)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (value) => setThemeState(value)
  const toggleTheme = () => setThemeState(prev => (resolveTheme(prev) === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggleTheme, isDark: resolved === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
