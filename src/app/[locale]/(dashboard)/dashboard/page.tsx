'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { useUsage, useProfile } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import {
  FileText,
  Sparkles,
  Key,
  ArrowRight,
  Upload,
  Wand2,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: usage, isLoading: usageLoading } = useUsage()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const t = useTranslations('dashboard')

  const isLoading = usageLoading || profileLoading

  const usageData = usage?.usage
  const limits = profile?.subscriptionLimits
  const stats = [
    {
      key: 'pagesGenerated',
      name: t('stats.pagesGenerated'),
      value: usageData?.pagesGenerated ?? 0,
      limit: limits?.pagesPerMonth ?? 100,
      icon: FileText,
      href: null,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      barColor: 'bg-primary',
    },
    {
      key: 'templates',
      name: t('stats.templates'),
      value: usageData?.templatesUploaded ?? 0,
      limit: limits?.templatesAllowed ?? 5,
      icon: FileText,
      href: '/templates',
      color: 'text-secondary',
      bgColor: 'bg-secondary-50',
      barColor: 'bg-secondary',
    },
    {
      key: 'apiKeys',
      name: t('stats.apiKeys'),
      value: usageData?.tokensCreated ?? 0,
      limit: limits?.apiTokensAllowed ?? 3,
      icon: Key,
      href: '/api-keys',
      color: 'text-info',
      bgColor: 'bg-blue-50',
      barColor: 'bg-info',
    },
  ]

  const quickActions = [
    {
      name: t('quickActions.generatePdf.name'),
      description: t('quickActions.generatePdf.description'),
      icon: Sparkles,
      href: '/generate',
      color: 'from-primary to-secondary',
    },
    {
      name: t('quickActions.uploadTemplate.name'),
      description: t('quickActions.uploadTemplate.description'),
      icon: Upload,
      href: '/templates',
      color: 'from-secondary to-primary',
    },
    {
      name: t('quickActions.aiGenerate.name'),
      description: t('quickActions.aiGenerate.description'),
      icon: Wand2,
      href: '/ai-generate',
      color: 'from-purple-500 to-pink-500',
    },
  ]

  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">
          {firstName ? t('welcome', { name: firstName }) : t('welcomeDefault')}
        </h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const isUnlimited = stat.limit === -1
          const percentage = isUnlimited ? 0 : (stat.value / stat.limit) * 100
          const cardContent = (
            <Card className={stat.href ? 'transition-shadow hover:shadow-md' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground-light">{stat.name}</p>
                    {isLoading ? (
                      <Spinner size="sm" className="mt-1" />
                    ) : (
                      <p className="text-2xl font-semibold text-foreground-dark">
                        {formatNumber(stat.value)}
                        <span className="text-sm font-normal text-foreground-light">
                          {isUnlimited ? ` / ${t('unlimited')}` : ` / ${formatNumber(stat.limit)}`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {!isLoading && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${stat.barColor} transition-all`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
          return stat.href ? (
            <Link key={stat.key} href={stat.href}>
              {cardContent}
            </Link>
          ) : (
            <div key={stat.key}>{cardContent}</div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground-dark">{t('quickActions.title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className={`h-1 bg-gradient-to-r ${action.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-gradient-to-br p-2.5 ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground-dark">{action.name}</p>
                        <p className="text-sm text-foreground-light">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-foreground-light transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      {(usageData?.templatesUploaded ?? 0) === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">{t('gettingStarted.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-foreground-light">
                {t('gettingStarted.intro')}
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-foreground-light">
                <li>
                  <Link href="/templates" className="text-primary hover:underline">
                    {t('gettingStarted.step1')}
                  </Link>
                </li>
                <li>
                  <Link href="/api-keys" className="text-primary hover:underline">
                    {t('gettingStarted.step2')}
                  </Link>{' '}
                  {t('gettingStarted.step2Suffix')}
                </li>
                <li>
                  <Link href="/generate" className="text-primary hover:underline">
                    {t('gettingStarted.step3')}
                  </Link>
                </li>
              </ol>
              <div className="pt-2">
                <Link href="/templates">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('gettingStarted.uploadFirstTemplate')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
