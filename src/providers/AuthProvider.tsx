'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  initializeAuth,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getUser,
} from '@/lib/auth'
import type { MkpdfsUser } from '@/types'

// Auth context state
interface AuthState {
  user: MkpdfsUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  error: string | null
}

// Auth context actions
interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

// Combined context type
type AuthContextType = AuthState & AuthActions

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

// Protected routes (dashboard area)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/templates',
  '/generate',
  '/api-keys',
  '/usage',
  '/settings',
  '/billing',
]

// Session check interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitializing: true,
    error: null,
  })

  // Initialize auth and check current session
  const checkAuth = useCallback(async () => {
    try {
      initializeAuth()

      const result = await getUser()

      if (result.success && result.data) {
        setState({
          user: result.data,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
          error: null,
        })
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitializing: false,
          error: null,
        })
      }
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: null,
      })
    }
  }, [])

  // Sign in handler
  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const result = await authSignIn(email, password)

      if (result.success && result.data?.isSignedIn) {
        // Fetch user details after successful sign in
        const userResult = await getUser()

        if (userResult.success && userResult.data) {
          setState({
            user: userResult.data,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            error: null,
          })
          return true
        }
      }

      // Handle sign in failure
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error || 'Failed to sign in',
      }))

      return false
    },
    []
  )

  // Sign up handler
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; needsConfirmation?: boolean }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const result = await authSignUp(email, password, name)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.success ? null : result.error || 'Failed to sign up',
      }))

      return {
        success: result.success,
        needsConfirmation: result.data?.needsConfirmation,
      }
    },
    []
  )

  // Sign out handler
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    await authSignOut()

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      error: null,
    })

    router.push('/login')
  }, [router])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const result = await getUser()

    if (result.success && result.data) {
      setState((prev) => ({
        ...prev,
        user: result.data!,
      }))
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Redirect based on auth state (runs after initialization completes)
  useEffect(() => {
    if (state.isInitializing || state.isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some((route) => {
      if (route === '/') return pathname === '/'
      return pathname.startsWith(route)
    })

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (!state.isAuthenticated && isProtectedRoute) {
      // Redirect to login if not authenticated and on protected route
      router.push('/login')
    } else if (
      state.isAuthenticated &&
      (pathname === '/login' || pathname === '/register')
    ) {
      // Redirect to dashboard if authenticated and on login/register page
      router.push('/dashboard')
    }
  }, [state.isAuthenticated, state.isLoading, state.isInitializing, pathname, router])

  // Periodic session check
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(() => {
      checkAuth()
    }, SESSION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [state.isAuthenticated, checkAuth])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      refreshUser,
      clearError,
    }),
    [state, signIn, signUp, signOut, refreshUser, clearError]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
