'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'mkpdfs-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Shared resolver — mirrors the inline no-flash script in layout.tsx.
// Stored explicit choice wins; else follow the OS; else default to dark
// (default-dark applies ONLY when matchMedia is unavailable, not when the OS is light).
function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'light' || theme === 'dark') return theme
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

function getStored(): Theme {
  if (typeof window === 'undefined') return 'system'
  const s = localStorage.getItem(STORAGE_KEY)
  return s === 'light' || s === 'dark' ? s : 'system'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read the persisted choice up front so we never start out of sync with the
  // class the inline head script already applied to <html>.
  const [theme, setThemeState] = useState<Theme>(getStored)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(getStored()))

  const updateResolvedTheme = useCallback(() => {
    const resolved = resolve(theme)
    setResolvedTheme(resolved)

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    updateResolvedTheme()

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, updateResolvedTheme])

  const setTheme = useCallback((newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      if (newTheme === 'system') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, newTheme)
      }
    }
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
