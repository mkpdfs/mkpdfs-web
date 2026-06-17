'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { toast } from '@/hooks/useToast'
import { ToastAction } from '@/components/ui/Toast'
import { apiErrorKey, isInsufficientCredits } from '@/lib/apiErrors'

/**
 * Centralized, localized error → toast handler for API failures.
 *
 * Returns `notifyApiError(error, { title? })`:
 * - On insufficient credits (402), shows a destructive toast with a
 *   "Buy credits" action that routes to billing.
 * - Otherwise maps the error to a localized message via the `errors` namespace.
 *
 * Replaces the old `err instanceof Error ? err.message : t('generic')` pattern
 * that leaked raw English backend strings to Spanish users.
 */
export function useApiError() {
  const t = useTranslations('errors')
  const common = useTranslations('common')
  const router = useRouter()

  return useCallback(
    (error: unknown, opts?: { title?: string }) => {
      if (isInsufficientCredits(error)) {
        toast({
          variant: 'destructive',
          title: t('insufficientCredits'),
          description: common('creditsRequired'),
          action: (
            <ToastAction
              altText={common('buyCredits')}
              onClick={() => router.push('/billing')}
            >
              {common('buyCredits')}
            </ToastAction>
          ),
        })
        return
      }

      toast({
        variant: 'destructive',
        title: opts?.title ?? common('error'),
        description: t(apiErrorKey(error)),
      })
    },
    [t, common, router]
  )
}
