'use client'

// Error boundary for every route under [locale] (landing, auth, dashboard).
// Rendered inside [locale]/layout's NextIntlClientProvider, so translations work.
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/Button'
import { rum } from '@/lib/rum-logger'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('common')

  useEffect(() => {
    rum.error('App', 'ErrorBoundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center text-fg">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">{t('errorTitle')}</h1>
        <p className="max-w-md text-fg-muted">{t('errorBody')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>{t('tryAgain')}</Button>
        <Button asChild variant="outline">
          <Link href="/">{t('goHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
