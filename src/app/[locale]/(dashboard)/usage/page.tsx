'use client'

import { useUsage } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import { FileText, Key, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

function formatPeriod(yearMonth: string, locale: string): string {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export default function UsagePage() {
  const { data: usage, isLoading } = useUsage()
  const t = useTranslations('usage')
  const locale = useLocale()

  const usageData = usage?.usage
  const usageStats = [
    {
      key: 'pdfsGenerated',
      value: usageData?.pdfGenerations ?? 0,
      limit: 100,
      icon: FileText,
      color: 'bg-primary',
    },
    {
      key: 'templates',
      value: usageData?.templatesUploaded ?? 0,
      limit: 5,
      icon: FileText,
      color: 'bg-secondary',
    },
    {
      key: 'apiKeys',
      value: usageData?.tokensCreated ?? 0,
      limit: 3,
      icon: Key,
      color: 'bg-info',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Current Period */}
          {usage && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-50 p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-light">{t('currentPeriod')}</p>
                    <p className="font-medium text-foreground-dark">
                      {formatPeriod(usage.currentPeriod, locale)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {usageStats.map((stat) => {
              const percentage = (stat.value / stat.limit) * 100
              return (
                <Card key={stat.key}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground-light">
                        {t(`${stat.key}.title`)}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground-dark">
                      {formatNumber(stat.value)}
                      <span className="text-sm font-normal text-foreground-light">
                        {' '}/ {formatNumber(stat.limit)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${stat.color} transition-all`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-sm text-foreground-light">
                        {t(`${stat.key}.used`, { used: stat.value, limit: stat.limit })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
