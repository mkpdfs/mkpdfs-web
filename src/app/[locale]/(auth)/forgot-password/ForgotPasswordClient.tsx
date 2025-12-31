'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { forgotPassword } from '@/lib/auth'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
import { FileText, ArrowLeft, Mail } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            {isSuccess ? (
              <Mail className="h-6 w-6 text-white" />
            ) : (
              <FileText className="h-6 w-6 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isSuccess ? t('successTitle') : t('title')}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? t('successSubtitle', { email })
              : t('subtitle')}
          </CardDescription>
        </CardHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!email}
              >
                {t('submit')}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToLogin')}
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-success/10 p-4 text-center text-sm text-success">
              {t('checkInbox')}
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                <Button className="w-full">
                  {t('enterCode')}
                </Button>
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
