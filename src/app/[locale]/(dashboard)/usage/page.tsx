'use client'

import { useUsage } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui'
import { formatNumber, formatDate } from '@/lib/utils'
import { BarChart3, FileText, Key, TrendingUp } from 'lucide-react'

export default function UsagePage() {
  const { data: usage, isLoading } = useUsage()

  const usageStats = [
    {
      name: 'PDFs Generated',
      value: usage?.pdfsGenerated ?? 0,
      limit: usage?.pdfsLimit ?? 100,
      icon: FileText,
      color: 'bg-primary',
    },
    {
      name: 'Templates',
      value: usage?.templatesCount ?? 0,
      limit: usage?.templatesLimit ?? 5,
      icon: FileText,
      color: 'bg-secondary',
    },
    {
      name: 'API Keys',
      value: usage?.tokensCount ?? 0,
      limit: usage?.tokensLimit ?? 1,
      icon: Key,
      color: 'bg-info',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">Usage</h1>
        <p className="mt-1 text-sm text-foreground-light">
          Monitor your monthly usage and limits.
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
                    <p className="text-sm text-foreground-light">Current Billing Period</p>
                    <p className="font-medium text-foreground-dark">
                      {formatDate(usage.currentPeriodStart)} - {formatDate(usage.currentPeriodEnd)}
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
                <Card key={stat.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground-light">
                        {stat.name}
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
                        {percentage.toFixed(0)}% used
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
