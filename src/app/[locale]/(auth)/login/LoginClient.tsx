'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { signInWithGoogle, isOAuthConfigured } from '@/lib/auth'
import { sanitizeRedirectPath } from '@/lib/utils'
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthBrandMark,
  AuthButton,
  AuthInput,
  AuthLabel,
  AuthDivider,
  AuthAlert,
  AuthLoader,
  GoogleGlyph,
} from '@/components/auth/primitives'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Read the sanitized `redirect` query param (relative app path only).
 * Uses window.location instead of useSearchParams to avoid the Suspense
 * requirement on statically generated pages.
 */
function getRedirectTarget(): string | null {
  if (typeof window === 'undefined') return null
  const param = new URLSearchParams(window.location.search).get('redirect')
  return sanitizeRedirectPath(param)
}

export default function LoginClient() {
  const router = useRouter()
  const locale = useLocale()
  const { signIn, isAuthenticated, isLoading, isInitializing, error, clearError } = useAuth()
  const t = useTranslations('auth.login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const oauthEnabled = isOAuthConfigured()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      // Query params are lost through the Cognito OAuth round-trip, so carry
      // the (locale-prefixed) destination via customState; /callback restores it.
      const redirect = getRedirectTarget()
      await signInWithGoogle(redirect ? `/${locale}${redirect}` : undefined)
    } catch {
      setIsGoogleLoading(false)
    }
  }

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace(getRedirectTarget() ?? '/dashboard')
    }
  }, [isInitializing, isAuthenticated, router])

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const success = await signIn(email, password)

    if (success) {
      router.push(getRedirectTarget() ?? '/dashboard')
    }

    setIsSubmitting(false)
  }

  if (isInitializing || isAuthenticated) {
    return <AuthLoader message={t('checkingSession')} />
  }

  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthBrandMark />
        <AuthCardTitle>{t('title')}</AuthCardTitle>
        <AuthCardDescription>{t('subtitle')}</AuthCardDescription>
      </AuthCardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AuthAlert>{error}</AuthAlert>}

        <div className="space-y-2">
          <AuthLabel htmlFor="email">{t('email')}</AuthLabel>
          <AuthInput
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            error={!!error}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <AuthLabel htmlFor="password">{t('password')}</AuthLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-brand-text hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <AuthInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              error={!!error}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-faint hover:text-fg"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            className="w-full"
            isLoading={isSubmitting || isLoading}
            disabled={!email || !password}
          >
            {t('submit')}
          </AuthButton>

          {oauthEnabled && (
            <>
              <AuthDivider label={t('orContinueWith')} />

              <AuthButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
              >
                <GoogleGlyph className="h-4 w-4" />
                {t('continueWithGoogle')}
              </AuthButton>
            </>
          )}

          <p className="text-center text-sm text-fg-muted">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-brand-text hover:underline">
              {t('signUp')}
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  )
}
