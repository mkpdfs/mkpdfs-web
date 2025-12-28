'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/providers'
import { useUsage, useTemplates, useTokens } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import {
  FileText,
  Sparkles,
  Key,
  BarChart3,
  ArrowRight,
  Plus,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: usage, isLoading: usageLoading } = useUsage()
  const { data: templates, isLoading: templatesLoading } = useTemplates()
  const { data: tokens, isLoading: tokensLoading } = useTokens()
  const t = useTranslations('dashboard')

  const isLoading = usageLoading || templatesLoading || tokensLoading

  const stats = [
    {
      name: t('stats.pdfsGenerated'),
      value: usage?.pdfsGenerated ?? 0,
      limit: usage?.pdfsLimit ?? 100,
      icon: FileText,
      href: '/usage',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
    },
    {
      name: t('stats.templates'),
      value: templates?.length ?? 0,
      limit: usage?.templatesLimit ?? 5,
      icon: FileText,
      href: '/templates',
      color: 'text-secondary',
      bgColor: 'bg-secondary-50',
    },
    {
      name: t('stats.apiKeys'),
      value: tokens?.length ?? 0,
      limit: usage?.tokensLimit ?? 1,
      icon: Key,
      href: '/api-keys',
      color: 'text-info',
      bgColor: 'bg-blue-50',
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
      icon: Plus,
      href: '/templates',
      color: 'from-secondary to-primary',
    },
    {
      name: t('quickActions.viewUsage.name'),
      description: t('quickActions.viewUsage.description'),
      icon: BarChart3,
      href: '/usage',
      color: 'from-primary-700 to-secondary-700',
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
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
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
                          {' '}
                          / {formatNumber(stat.limit)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
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
      {templates?.length === 0 && (
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
                    <Plus className="mr-2 h-4 w-4" />
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
