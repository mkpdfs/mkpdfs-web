'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hub } from 'aws-amplify/utils'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { initializeAuth } from '@/lib/auth'
import { sanitizeRedirectPath } from '@/lib/utils'
import { PageLoader } from '@/components/ui'

export default function CallbackClient() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  // Post-login destination carried through the OAuth round-trip via
  // customState (set by LoginClient as a locale-prefixed path).
  const redirectTargetRef = useRef<string | null>(null)

  useEffect(() => {
    // Initialize auth if not already done
    initializeAuth()

    const checkAuth = async () => {
      try {
        // Try to get the current user - if OAuth was successful, user should be available
        const user = await getCurrentUser()
        const attributes = await fetchUserAttributes()

        console.info('[Callback] OAuth successful, user:', user.userId, attributes.email)

        // Redirect to the preserved destination, or dashboard by default
        router.replace(redirectTargetRef.current ?? '/dashboard')
      } catch (err) {
        console.error('[Callback] Auth check failed:', err)
        // If no user yet, wait for the Hub event
      }
    }

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.info('[Callback] Auth event:', payload.event)

      switch (payload.event) {
        case 'signInWithRedirect':
          console.info('[Callback] Sign in redirect completed')
          checkAuth()
          break
        case 'signInWithRedirect_failure':
          console.error('[Callback] Sign in redirect failed:', payload.data)
          setError('Failed to sign in with Google. Please try again.')
          setTimeout(() => router.replace('/login'), 3000)
          break
        case 'customOAuthState': {
          console.info('[Callback] Custom OAuth state:', payload.data)
          const target = sanitizeRedirectPath(
            typeof payload.data === 'string' ? payload.data : null
          )
          if (target) {
            redirectTargetRef.current = target
            // Re-run in case the signInWithRedirect handler already navigated
            // to the default destination before this event arrived.
            checkAuth()
          }
          break
        }
      }
    })

    // Check if already authenticated (in case event was missed)
    checkAuth()

    return () => unsubscribe()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <PageLoader message="Completing sign in..." />
}
