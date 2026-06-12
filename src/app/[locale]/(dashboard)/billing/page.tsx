'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { CreditCard, Zap, Loader2, ExternalLink, AlertTriangle, History } from 'lucide-react'
import { useProfile } from '@/hooks/useApi'
import { createCheckoutSession, createPortalSession, updateAutoRecharge, getCreditLedger } from '@/lib/api'
import type { LedgerEntry } from '@/types'
import { useTranslations } from 'next-intl'
import { useQueryClient, useQuery } from '@tanstack/react-query'

export default function BillingPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading, refetch } = useProfile()
  const [loadingBuy, setLoadingBuy] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [savingAutoRecharge, setSavingAutoRecharge] = useState(false)
  const [threshold, setThreshold] = useState<number | null>(null)
  const t = useTranslations('billing')
  const errors = useTranslations('errors')

  const { data: ledger } = useQuery({
    queryKey: ['creditLedger'],
    queryFn: getCreditLedger,
  })

  const sub = profile?.subscription
  const isEnterprise = sub?.plan === 'enterprise'
  const balance = sub?.creditBalance ?? 0
  const autoRechargeOn = !!sub?.autoRecharge
  const effectiveThreshold = threshold ?? sub?.rechargeThreshold ?? 100
  const hasCard = !!sub?.stripePaymentMethodId

  // Poll after returning from Stripe checkout so the webhook-credited
  // balance shows up without a manual refresh
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    let pollCount = 0
    const interval = setInterval(() => {
      pollCount++
      refetch()
      queryClient.invalidateQueries({ queryKey: ['creditLedger'] })
      if (pollCount >= 6) clearInterval(interval)
    }, 5000)
    return () => clearInterval(interval)
  }, [queryClient, refetch])

  const handleBuy = async () => {
    try {
      setLoadingBuy(true)
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert(errors('generic'))
      setLoadingBuy(false)
    }
  }

  const handlePortal = async () => {
    try {
      setLoadingPortal(true)
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert(errors('generic'))
      setLoadingPortal(false)
    }
  }

  const handleAutoRechargeToggle = async (enabled: boolean) => {
    try {
      setSavingAutoRecharge(true)
      await updateAutoRecharge(enabled, effectiveThreshold)
      await refetch()
    } catch (error) {
      console.error('Failed to update auto-recharge:', error)
      alert(errors('generic'))
    } finally {
      setSavingAutoRecharge(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">{t('subtitle')}</p>
      </div>

      {sub?.autoRechargeError && (
        <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{t('autoRecharge.failedBanner', { reason: sub.autoRechargeError })}</span>
        </div>
      )}

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            {t('balance.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-foreground-dark">
                {isEnterprise ? t('balance.enterprise') : t('balance.credits', { count: balance })}
              </p>
              {!isEnterprise && (
                <p className="mt-1 text-sm text-foreground-light">{t('balance.hint')}</p>
              )}
            </div>
            {!isEnterprise && (
              <div className="flex gap-2">
                {hasCard && (
                  <Button variant="outline" onClick={handlePortal} disabled={loadingPortal}>
                    {loadingPortal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    {t('balance.updateCard')}
                  </Button>
                )}
                <Button onClick={handleBuy} disabled={loadingBuy}>
                  {loadingBuy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {t('balance.buy')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-recharge */}
      {!isEnterprise && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('autoRecharge.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground-light">{t('autoRecharge.description')}</p>
            {!hasCard ? (
              <p className="text-sm text-foreground-light">{t('autoRecharge.needsPurchase')}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground-dark">
                  {t('autoRecharge.threshold')}
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1"
                    value={effectiveThreshold}
                    disabled={autoRechargeOn}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || '1', 10)
                      setThreshold(Math.min(1000, Math.max(1, v)))
                    }}
                  />
                </label>
                <Button
                  variant={autoRechargeOn ? 'outline' : 'default'}
                  onClick={() => handleAutoRechargeToggle(!autoRechargeOn)}
                  disabled={savingAutoRecharge}
                >
                  {savingAutoRecharge && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {autoRechargeOn ? t('autoRecharge.disable') : t('autoRecharge.enable')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            {t('history.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!ledger?.entries?.length ? (
            <p className="text-sm text-foreground-light">{t('history.empty')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {ledger.entries.map((entry: LedgerEntry) => (
                <li key={entry.entryId} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="text-foreground-dark">{t(`history.${entry.type}`)}</p>
                    <p className="text-xs text-foreground-light">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={entry.amount > 0 ? 'font-medium text-success' : 'text-foreground-dark'}>
                      {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                    </p>
                    {entry.balanceAfter != null && (
                      <p className="text-xs text-foreground-light">
                        {t('history.balanceAfter', { count: entry.balanceAfter })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
