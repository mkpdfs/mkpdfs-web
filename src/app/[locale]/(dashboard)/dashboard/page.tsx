'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { useUsage, useProfile } from '@/hooks/useApi'
import { Spinner } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import {
  FileText,
  LayoutDashboard,
  Key,
  Zap,
  Upload,
  Sparkles,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react'

const ONBOARDING_DISMISSED_KEY = 'mkpdfs_onboarding_dismissed'

function StatCard({
  label,
  value,
  limit,
  unlimitedLabel,
  icon: Icon,
  isLoading,
}: {
  label: string
  value: number
  limit: number | null
  unlimitedLabel: string
  icon: LucideIcon
  isLoading: boolean
}) {
  const isUnlimited = limit === -1
  const pct = limit == null || isUnlimited ? 0 : Math.min((value / limit) * 100, 100)

  return (
    <div className="rounded-[14px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] px-[22px] py-5">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-[#9C9CA8]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#B7A6FF]" strokeWidth={1.9} />
      </div>
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-[30px] font-bold leading-none tracking-[-0.03em]">
            {formatNumber(value)}
          </span>
          {limit != null && (
            <span className="font-geist-mono text-[13px] text-[#7E7E89]">
              / {isUnlimited ? unlimitedLabel : formatNumber(limit)}
            </span>
          )}
        </div>
      )}
      <div className="mt-3.5 h-1 overflow-hidden rounded-sm bg-white/[0.07]">
        <div
          className="h-full rounded-sm bg-[linear-gradient(90deg,#8C6CFF,#B7A6FF)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: usage, isLoading: usageLoading } = useUsage()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const t = useTranslations('dashboard')
  const [onboardingDismissed, setOnboardingDismissed] = useState(true) // Default true to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY)
    setOnboardingDismissed(dismissed === 'true')
  }, [])

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
    setOnboardingDismissed(true)
  }

  const isLoading = usageLoading || profileLoading

  const usageData = usage?.usage
  const limits = profile?.subscriptionLimits

  const stats = [
    {
      key: 'pages',
      label: t('stats.pages'),
      value: usageData?.pagesGenerated ?? 0,
      limit: null as number | null,
      icon: FileText,
    },
    {
      key: 'templates',
      label: t('stats.templates'),
      value: usageData?.templatesUploaded ?? 0,
      limit: limits?.templatesAllowed ?? 5,
      icon: LayoutDashboard,
    },
    {
      key: 'apiKeys',
      label: t('stats.apiKeys'),
      value: usageData?.tokensCreated ?? 0,
      limit: limits?.apiTokensAllowed ?? 3,
      icon: Key,
    },
  ]

  const quickActions = [
    {
      name: t('quickActions.generatePdf.name'),
      description: t('quickActions.generatePdf.description'),
      icon: Zap,
      href: '/integration',
    },
    {
      name: t('quickActions.uploadTemplate.name'),
      description: t('quickActions.uploadTemplate.description'),
      icon: Upload,
      href: '/templates',
    },
    {
      name: t('quickActions.aiGenerate.name'),
      description: t('quickActions.aiGenerate.description'),
      icon: Sparkles,
      href: '/ai-generate',
    },
  ]

  const steps = [
    {
      done: (usageData?.templatesUploaded ?? 0) > 0,
      href: '/templates',
      label: t('gettingStarted.step1'),
      suffix: null as string | null,
    },
    {
      done: (usageData?.tokensCreated ?? 0) > 0,
      href: '/api-keys',
      label: t('gettingStarted.step2'),
      suffix: t('gettingStarted.step2Suffix'),
    },
    {
      done: (usageData?.pagesGenerated ?? 0) > 0,
      href: '/integration',
      label: t('gettingStarted.step3'),
      suffix: null,
    },
  ]
  const doneCount = steps.filter((s) => s.done).length

  const firstName = user?.name?.split(' ')[0]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">
          {firstName ? t('welcome', { name: firstName }) : t('welcomeDefault')}
        </h1>
        <p className="text-[14.5px] text-[#9C9CA8]">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            limit={stat.limit}
            unlimitedLabel={t('unlimited')}
            icon={stat.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-3 font-geist-mono text-[11.5px] uppercase tracking-[0.1em] text-[#7E7E89]">
        {t('quickActions.title')}
      </div>
      <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3.5 rounded-[14px] border border-white/[0.09] bg-[#0C0C0F] px-5 py-[18px] transition-all hover:-translate-y-0.5 hover:border-[#8C6CFF]/45 hover:bg-[#0E0E12]"
          >
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.14] text-[#B7A6FF]">
              <action.icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-[3px] text-[15px] font-semibold">{action.name}</div>
              <div className="truncate text-[13px] text-[#7E7E89]">{action.description}</div>
            </div>
            <span className="text-base text-[#5C5C66]">→</span>
          </Link>
        ))}
      </div>

      {/* Get started */}
      {!onboardingDismissed && (
        <div className="relative rounded-2xl border border-[#8C6CFF]/[0.28] bg-[linear-gradient(140deg,rgba(124,92,255,0.07),rgba(255,255,255,0.01))] px-7 py-[26px]">
          <button
            onClick={dismissOnboarding}
            aria-label={t('gettingStarted.dismiss')}
            className="absolute right-4 top-4 flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#7E7E89] transition-colors hover:bg-white/[0.06] hover:text-[#F4F4F6]"
          >
            <X className="h-[15px] w-[15px]" />
          </button>
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold tracking-[-0.015em]">
              {t('gettingStarted.title')}
            </h2>
            <span className="rounded-full border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.13] px-2.5 py-[3px] font-geist-mono text-[11.5px] text-[#B7A6FF]">
              {t('gettingStarted.progress', { done: doneCount })}
            </span>
          </div>
          <p className="mb-5 text-[13.5px] text-[#9C9CA8]">{t('gettingStarted.intro')}</p>

          <div className="flex max-w-[560px] flex-col gap-1">
            {steps.map((step, i) =>
              step.done ? (
                <div key={i} className="-mx-3.5 flex items-center gap-3.5 px-3.5 py-[11px]">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#3FBF7F]/50 bg-[#3FBF7F]/[0.15]">
                    <Check className="h-[13px] w-[13px] text-[#7CF0B0]" strokeWidth={2.6} />
                  </span>
                  <span className="flex-1 text-[14.5px] font-medium text-[#7E7E89] line-through decoration-white/25">
                    {step.label}
                  </span>
                </div>
              ) : (
                <Link
                  key={i}
                  href={step.href}
                  className="-mx-3.5 flex items-center gap-3.5 rounded-[11px] px-3.5 py-[11px] transition-colors hover:bg-white/[0.04]"
                >
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#8C6CFF]/50 font-geist-mono text-xs font-semibold text-[#B7A6FF]">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[14.5px] font-medium text-[#F4F4F6]">
                    {step.label}
                    {step.suffix && (
                      <span className="font-normal text-[#7E7E89]"> {step.suffix}</span>
                    )}
                  </span>
                  <span className="text-[#5C5C66]">→</span>
                </Link>
              )
            )}
          </div>

          {(usageData?.templatesUploaded ?? 0) === 0 && (
            <Link
              href="/templates"
              className="mt-[18px] inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-5 py-[11px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)]"
            >
              <Upload className="h-[15px] w-[15px]" strokeWidth={2} />
              {t('gettingStarted.uploadFirstTemplate')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
