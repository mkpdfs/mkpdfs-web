'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthBrandMark,
  AuthButton,
  AuthAlert,
  AuthLoader,
} from '@/components/auth/primitives'
import { approveCliDevice } from '@/lib/cliAuth'

export default function AuthorizeClient() {
  const t = useTranslations('cli.authorize')
  const tc = useTranslations('common')
  const router = useRouter()
  const { isAuthenticated, isInitializing, isLoading } = useAuth()
  const [code, setCode] = useState('')
  const [state, setState] = useState<
    'idle' | 'submitting' | 'done' | 'denied' | 'error'
  >('idle')

  useEffect(() => {
    if (!isInitializing && !isLoading && !isAuthenticated) {
      // Preserve any query params the CLI may attach so they survive the
      // login round-trip (pathname is always /cli/authorize for this page).
      const here = '/cli/authorize' + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(here)}`)
    }
  }, [isAuthenticated, isInitializing, isLoading, router])

  if (isInitializing || isLoading || !isAuthenticated) {
    return <AuthLoader message={tc('loading')} />
  }

  const act = async (action: 'approve' | 'deny') => {
    setState('submitting')
    try {
      await approveCliDevice(code, action)
      setState(action === 'approve' ? 'done' : 'denied')
    } catch {
      setState('error')
    }
  }

  if (state === 'done' || state === 'denied') {
    return (
      <AuthCard>
        <AuthCardHeader>
          <AuthBrandMark />
          <AuthCardTitle>
            {state === 'done' ? t('successTitle') : t('deniedTitle')}
          </AuthCardTitle>
          <AuthCardDescription>{t('returnToTerminal')}</AuthCardDescription>
        </AuthCardHeader>
      </AuthCard>
    )
  }

  const valid = code.replace(/[^a-zA-Z0-9]/g, '').length === 8
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthBrandMark />
        <AuthCardTitle>{t('title')}</AuthCardTitle>
        <AuthCardDescription>{t('subtitle')}</AuthCardDescription>
      </AuthCardHeader>

      <div className="space-y-4">
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX"
          className="w-full rounded-[10px] border border-ink/10 bg-surface p-3 text-center font-geist-mono text-2xl tracking-widest text-fg outline-none transition placeholder:text-fg-faint focus:border-brand/60 focus:ring-2 focus:ring-brand/25"
          maxLength={9}
        />
        <p className="text-sm text-fg-muted">{t('warning')}</p>
        {state === 'error' && <AuthAlert>{t('error')}</AuthAlert>}
        <div className="flex gap-3">
          <AuthButton
            variant="danger"
            className="flex-1"
            disabled={!valid || state === 'submitting'}
            onClick={() => act('deny')}
          >
            {t('deny')}
          </AuthButton>
          <AuthButton
            className="flex-1"
            disabled={!valid || state === 'submitting'}
            isLoading={state === 'submitting'}
            onClick={() => act('approve')}
          >
            {t('approve')}
          </AuthButton>
        </div>
      </div>
    </AuthCard>
  )
}
