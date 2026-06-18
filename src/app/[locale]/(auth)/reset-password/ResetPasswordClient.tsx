'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/routing'
import { confirmForgotPassword } from '@/lib/auth'
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthBrandMark,
  AuthButton,
  AuthInput,
  AuthLabel,
  AuthAlert,
  AuthLoader,
} from '@/components/auth/primitives'
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth.resetPassword')
  const register = useTranslations('auth.register')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Password requirements
  const passwordRequirements = [
    { label: register('requirements.minLength'), met: password.length >= 8 },
    { label: register('requirements.uppercase'), met: /[A-Z]/.test(password) },
    { label: register('requirements.lowercase'), met: /[a-z]/.test(password) },
    { label: register('requirements.number'), met: /[0-9]/.test(password) },
    { label: register('requirements.specialChar'), met: /[^A-Za-z0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      setError(register('passwordNotMet'))
      return
    }

    if (!passwordsMatch) {
      setError(register('passwordMismatch'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await confirmForgotPassword(email, code, password)

    if (result.success) {
      router.push('/login?reset=true')
    } else {
      setError(result.error || t('failedToReset'))
    }

    setIsSubmitting(false)
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
          />
        </div>

        <div className="space-y-2">
          <AuthLabel htmlFor="code">{t('code')}</AuthLabel>
          <AuthInput
            id="code"
            type="text"
            placeholder={t('codePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="one-time-code"
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <div className="space-y-2">
          <AuthLabel htmlFor="password">{t('newPassword')}</AuthLabel>
          <div className="relative">
            <AuthInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('newPasswordPlaceholder')}
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
            <p className="text-xs text-danger">{register('passwordMismatch')}</p>
          )}
        </div>

        <div className="flex flex-col space-y-4 pt-2">
          <AuthButton
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!email || !code || !allRequirementsMet || !passwordsMatch}
          >
            {t('submit')}
          </AuthButton>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToLogin')}
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}

export default function ResetPasswordClient() {
  const t = useTranslations('common')
  return (
    <Suspense fallback={<AuthLoader message={t('loading')} />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
