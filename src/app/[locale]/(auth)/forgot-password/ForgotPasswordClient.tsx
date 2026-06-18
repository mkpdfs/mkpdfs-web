'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { forgotPassword } from '@/lib/auth'
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
} from '@/components/auth/primitives'
import { ArrowLeft, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('auth.forgotPassword')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await forgotPassword(email)

    if (result.success) {
      setIsSuccess(true)
    } else {
      setError(result.error || t('failedToSend'))
    }

    setIsSubmitting(false)
  }

  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthBrandMark icon={isSuccess ? Mail : undefined} />
        <AuthCardTitle>
          {isSuccess ? t('successTitle') : t('title')}
        </AuthCardTitle>
        <AuthCardDescription>
          {isSuccess ? t('successSubtitle', { email }) : t('subtitle')}
        </AuthCardDescription>
      </AuthCardHeader>

      {!isSuccess ? (
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

          <div className="flex flex-col space-y-4 pt-2">
            <AuthButton
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!email}
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
      ) : (
        <div className="space-y-4">
          <AuthAlert tone="ok" className="text-center">
            {t('checkInbox')}
          </AuthAlert>

          <div className="flex flex-col gap-3">
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <AuthButton className="w-full">{t('enterCode')}</AuthButton>
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  )
}
