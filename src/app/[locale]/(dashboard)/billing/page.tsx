'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react'
import { useProfile, useUsage } from '@/hooks/useApi'
import { createCheckoutSession, createPortalSession, updateAutoRecharge, getCreditLedger } from '@/lib/api'
import { rum } from '@/lib/rum-logger'
import { formatNumber } from '@/lib/utils'
import type { LedgerEntry } from '@/types'
import { useTranslations } from 'next-intl'
import { useQueryClient, useQuery } from '@tanstack/react-query'

const PACK_CREDITS = 1000 // $10 pack
const PRICE_PER_PAGE = 0.01

export default function BillingPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading, refetch } = useProfile()
  const { data: usage } = useUsage()
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

  const monthPages = usage?.usage?.pagesGenerated ?? 0
  const monthSpend = monthPages * PRICE_PER_PAGE
  const balanceUsd = balance * PRICE_PER_PAGE
  const packPct = Math.min((balance / PACK_CREDITS) * 100, 100)

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
      rum.error('Billing', 'Failed to create checkout session:', error)
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
      rum.error('Billing', 'Failed to create portal session:', error)
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
      rum.error('Billing', 'Failed to update auto-recharge:', error)
      alert(errors('generic'))
    } finally {
      setSavingAutoRecharge(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C6CFF]" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('title')}</h1>
        <p className="text-[14.5px] text-fg-muted">{t('tagline')}</p>
      </div>

      {/* Auto-recharge failure banner */}
      {sub?.autoRechargeError && (
        <div className="mb-4 flex items-start gap-3 rounded-[12px] border border-danger-soft/30 bg-danger-soft/[0.07] px-4 py-3.5 text-[13.5px] text-danger-soft">
          <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
          <span>{t('autoRecharge.failedBanner', { reason: sub.autoRechargeError })}</span>
        </div>
      )}

      {/* Top grid: balance + this month */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
        {/* Credit balance */}
        <div className="rounded-2xl border border-[#8C6CFF]/30 bg-[linear-gradient(140deg,rgba(124,92,255,0.08),rgba(255,255,255,0.01))] px-7 py-[26px]">
          <div className="mb-3 font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted">
            {t('balance.title')}
          </div>

          {isEnterprise ? (
            <div className="text-[34px] font-bold leading-none tracking-[-0.03em]">
              {t('balance.enterprise')}
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[42px] font-bold leading-none tracking-[-0.03em]">
                  ${balanceUsd.toFixed(2)}
                </span>
                <span className="font-geist-mono text-[14px] text-ok">
                  {t('balance.pages', { count: balance })}
                </span>
              </div>

              <div className="mb-2 mt-[18px] h-[5px] overflow-hidden rounded-[3px] bg-ink/[0.08]">
                <div
                  className="h-full rounded-[3px] bg-[linear-gradient(90deg,#8C6CFF,#B7A6FF)] transition-all"
                  style={{ width: `${packPct}%` }}
                />
              </div>
              <div className="mb-5 text-[12.5px] text-fg-dim">{t('balance.hint')}</div>

              {/* Top up */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="mr-0.5 text-[13.5px] text-fg-muted">{t('balance.topUp')}</span>
                <button
                  onClick={handleBuy}
                  disabled={loadingBuy}
                  aria-label={t('balance.buy')}
                  className="inline-flex h-[34px] items-center gap-2 rounded-[9px] border border-[#8C6CFF]/40 bg-[#8C6CFF]/[0.13] px-4 font-geist-mono text-[13px] font-semibold text-brand-strong transition-colors hover:bg-[#8C6CFF]/[0.22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingBuy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  $10
                </button>
                <span className="text-[12.5px] text-fg-dim">{t('balance.packNote')}</span>
                {hasCard && (
                  <button
                    onClick={handlePortal}
                    disabled={loadingPortal}
                    className="ml-auto inline-flex h-[34px] items-center gap-2 rounded-[9px] border border-ink/[0.12] bg-ink/[0.04] px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingPortal ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 text-fg-muted" strokeWidth={1.9} />
                    )}
                    {t('balance.updateCard')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* This month */}
        <div className="rounded-2xl border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] px-7 py-[26px]">
          <div className="mb-3 font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted">
            {t('thisMonth.title')}
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-fg-muted">{t('thisMonth.pages')}</span>
              <span className="font-geist-mono text-[14px] font-semibold">
                {formatNumber(monthPages)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-fg-muted">{t('thisMonth.spend')}</span>
              <span className="font-geist-mono text-[14px] font-semibold">
                ${monthSpend.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-fg-muted">{t('thisMonth.avg')}</span>
              <span className="font-geist-mono text-[14px] font-semibold">
                ${PRICE_PER_PAGE.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-recharge */}
      {!isEnterprise && (
        <div className="mb-4 rounded-2xl border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] px-7 py-[26px]">
          <div className="mb-3 font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted">
            {t('autoRecharge.title')}
          </div>
          <p className="mb-5 max-w-[560px] text-[13.5px] text-fg-muted">
            {t('autoRecharge.description')}
          </p>
          {!hasCard ? (
            <p className="text-[13.5px] text-fg-dim">{t('autoRecharge.needsPurchase')}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                role="switch"
                aria-checked={autoRechargeOn}
                aria-label={autoRechargeOn ? t('autoRecharge.disable') : t('autoRecharge.enable')}
                onClick={() => handleAutoRechargeToggle(!autoRechargeOn)}
                disabled={savingAutoRecharge}
                className="inline-flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`relative inline-flex h-[22px] w-[40px] shrink-0 rounded-full border transition-colors ${
                    autoRechargeOn
                      ? 'border-[#8C6CFF]/60 bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)]'
                      : 'border-ink/[0.14] bg-ink/[0.06]'
                  }`}
                >
                  <span
                    className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all ${
                      autoRechargeOn ? 'left-[20px]' : 'left-[2px] opacity-70'
                    }`}
                  />
                </span>
                <span className="text-[13.5px] font-medium text-fg">
                  {savingAutoRecharge ? (
                    <Loader2 className="h-4 w-4 animate-spin text-fg-muted" />
                  ) : autoRechargeOn ? (
                    t('autoRecharge.disable')
                  ) : (
                    t('autoRecharge.enable')
                  )}
                </span>
              </button>
              <label className="flex items-center gap-2.5 text-[13.5px] text-fg-muted">
                {t('autoRecharge.threshold')}
                <input
                  type="number"
                  min={1}
                  max={1000}
                  className="h-[34px] w-24 rounded-[9px] border border-ink/10 bg-ink/[0.03] px-2.5 font-geist-mono text-[13px] text-fg outline-none transition-colors focus:border-[#8C6CFF]/50 disabled:opacity-50"
                  value={effectiveThreshold}
                  disabled={autoRechargeOn}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '1', 10)
                    setThreshold(Math.min(1000, Math.max(1, v)))
                  }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div className="rounded-2xl border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]">
        <div className="border-b border-ink/[0.07] px-6 py-[18px] text-[15px] font-semibold">
          {t('history.title')}
        </div>
        {!ledger?.entries?.length ? (
          <div className="px-6 py-9 text-center text-[14px] text-fg-dim">
            {t('history.empty')}
          </div>
        ) : (
          <div className="divide-y divide-ink/[0.06]">
            {ledger.entries.map((entry: LedgerEntry) => {
              const isCredit = entry.amount > 0
              return (
                <div
                  key={entry.entryId}
                  className="flex items-center justify-between gap-4 px-6 py-3.5"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <span
                      className={`rounded-full border px-2.5 py-[3px] font-geist-mono text-[11.5px] ${
                        isCredit
                          ? 'border-ok/35 bg-ok/10 text-ok'
                          : 'border-ink/10 bg-ink/[0.05] text-fg-muted'
                      }`}
                    >
                      {t(`history.${entry.type}`)}
                    </span>
                    {entry.description && (
                      <span className="truncate text-[13.5px] text-fg-muted">
                        {entry.description}
                      </span>
                    )}
                    <span className="text-[13px] text-fg-dim">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`font-geist-mono text-[14px] font-semibold ${
                        isCredit ? 'text-ok' : 'text-fg'
                      }`}
                    >
                      {isCredit ? `+${formatNumber(entry.amount)}` : formatNumber(entry.amount)}
                    </div>
                    {entry.balanceAfter != null && (
                      <div className="font-geist-mono text-[12px] text-fg-dim">
                        {t('history.balanceAfter', { count: entry.balanceAfter })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
