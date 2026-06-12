'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { approveCliDevice } from '@/lib/cliAuth'

export default function AuthorizeClient() {
  const t = useTranslations('cli.authorize')
  const router = useRouter()
  const { isAuthenticated, isInitializing, isLoading } = useAuth()
  const [code, setCode] = useState('')
  const [state, setState] = useState<
    'idle' | 'submitting' | 'done' | 'denied' | 'error'
  >('idle')

  useEffect(() => {
    if (!isInitializing && !isLoading && !isAuthenticated)
      router.push('/login?redirect=/cli/authorize')
  }, [isAuthenticated, isInitializing, isLoading, router])

  if (isInitializing || isLoading || !isAuthenticated) return null

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
      <Card className="max-w-md mx-auto mt-16">
        <CardHeader>
          <CardTitle>
            {state === 'done' ? t('successTitle') : t('deniedTitle')}
          </CardTitle>
          <CardDescription>{t('returnToTerminal')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const valid = code.replace(/[^a-zA-Z0-9]/g, '').length === 8
  return (
    <Card className="max-w-md mx-auto mt-16">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX"
          className="w-full text-center text-2xl font-mono tracking-widest rounded-md border border-border bg-background p-3"
          maxLength={9}
        />
        <p className="text-sm text-muted-foreground">{t('warning')}</p>
        {state === 'error' && (
          <p className="text-sm text-destructive">{t('error')}</p>
        )}
        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!valid || state === 'submitting'}
            onClick={() => act('deny')}
          >
            {t('deny')}
          </Button>
          <Button
            className="flex-1"
            disabled={!valid || state === 'submitting'}
            isLoading={state === 'submitting'}
            onClick={() => act('approve')}
          >
            {t('approve')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
