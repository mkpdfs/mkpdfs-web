'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { confirmSignUp, signInWithGoogle, isOAuthConfigured } from '@/lib/auth'
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
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function RegisterClient() {
  const router = useRouter()
  const { signUp, signIn, isAuthenticated, isLoading, isInitializing, error, clearError } = useAuth()
  const t = useTranslations('auth.register')
  const login = useTranslations('auth.login')

  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const oauthEnabled = isOAuthConfigured()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setIsGoogleLoading(false)
    }
  }

  // Password requirements
  const passwordRequirements = [
    { label: t('requirements.minLength'), met: password.length >= 8 },
    { label: t('requirements.uppercase'), met: /[A-Z]/.test(password) },
    { label: t('requirements.lowercase'), met: /[a-z]/.test(password) },
    { label: t('requirements.number'), met: /[0-9]/.test(password) },
    { label: t('requirements.specialChar'), met: /[^A-Za-z0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isInitializing, isAuthenticated, router])

  // Clear error when inputs change
  useEffect(() => {
    if (error || localError) {
      clearError()
      setLocalError(null)
    }
  }, [email, password, name, verificationCode])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      setLocalError(t('passwordNotMet'))
      return
    }

    if (!passwordsMatch) {
      setLocalError(t('passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    const result = await signUp(email, password, name)

    if (result.success && result.needsConfirmation) {
      setStep('verify')
    }

    setIsSubmitting(false)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLocalError(null)

    const result = await confirmSignUp(email, verificationCode)

    if (result.success) {
      // Auto-login after verification
      const signInResult = await signIn(email, password)
      if (signInResult) {
        router.push('/dashboard')
      } else {
        // Fallback: redirect to login if auto-login fails
        router.push('/login')
      }
    } else {
      setLocalError(result.error || t('verify.invalidCode'))
    }

    setIsSubmitting(false)
  }

  if (isInitializing || isAuthenticated) {
    return <AuthLoader message={login('checkingSession')} />
  }

  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthBrandMark />
        <AuthCardTitle>
          {step === 'register' ? t('title') : t('verify.title')}
        </AuthCardTitle>
        <AuthCardDescription>
          {step === 'register'
            ? t('subtitle')
            : t('verify.subtitle', { email })}
        </AuthCardDescription>
      </AuthCardHeader>

      {step === 'register' ? (
        <form onSubmit={handleRegister} className="space-y-4">
          {(error || localError) && (
            <AuthAlert>{error || localError}</AuthAlert>
          )}

          <div className="space-y-2">
            <AuthLabel htmlFor="name">{t('name')}</AuthLabel>
            <AuthInput
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
            />
          </div>

          <div className="space-y-2">
            <AuthLabel htmlFor="password">{t('password')}</AuthLabel>
            <div className="relative">
              <AuthInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

            {password.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs">
                {passwordRequirements.map((req, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-1 ${
                      req.met ? 'text-ok' : 'text-fg-faint'
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <AuthLabel htmlFor="confirmPassword">{t('confirmPassword')}</AuthLabel>
            <AuthInput
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={confirmPassword.length > 0 && !passwordsMatch}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-danger">{t('passwordMismatch')}</p>
            )}
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <AuthButton
              type="submit"
              className="w-full"
              isLoading={isSubmitting || isLoading}
              disabled={!name || !email || !allRequirementsMet || !passwordsMatch}
            >
              {t('submit')}
            </AuthButton>

            {oauthEnabled && (
              <>
                <AuthDivider label={login('orContinueWith')} />

                <AuthButton
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  isLoading={isGoogleLoading}
                >
                  <GoogleGlyph className="h-4 w-4" />
                  {login('continueWithGoogle')}
                </AuthButton>
              </>
            )}

            <p className="text-center text-sm text-fg-muted">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-brand-text hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          {localError && <AuthAlert>{localError}</AuthAlert>}

          <div className="space-y-2">
            <AuthLabel htmlFor="code">{t('verify.code')}</AuthLabel>
            <AuthInput
              id="code"
              type="text"
              placeholder={t('verify.codePlaceholder')}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <AuthButton
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={verificationCode.length !== 6}
            >
              {t('verify.submit')}
            </AuthButton>

            <button
              type="button"
              onClick={() => setStep('register')}
              className="text-sm text-fg-muted hover:text-fg"
            >
              {t('verify.backToRegister')}
            </button>
          </div>
        </form>
      )}
    </AuthCard>
  )
}
