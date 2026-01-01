'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { CreditCard, Check, Zap, Loader2, ExternalLink } from 'lucide-react'
import { useProfile } from '@/hooks/useApi'
import { createCheckoutSession, createPortalSession } from '@/lib/api'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'

export default function BillingPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading, refetch } = useProfile()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const t = useTranslations('billing')
  const pricing = useTranslations('landing.pricing')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const plans = [
    {
      id: 'free',
      name: pricing('free.name'),
      price: '$0',
      description: pricing('free.description'),
      features: [
        pricing('free.features.pages'),
        pricing('free.features.templates'),
        pricing('free.features.keys'),
        pricing('free.features.fileSize'),
        pricing('free.features.support'),
      ],
    },
    {
      id: 'basic',
      name: pricing('starter.name'),
      price: '$29.99',
      description: pricing('starter.description'),
      features: [
        pricing('starter.features.pages'),
        pricing('starter.features.templates'),
        pricing('starter.features.keys'),
        pricing('starter.features.fileSize'),
        pricing('starter.features.support'),
      ],
      popular: true,
    },
    {
      id: 'professional',
      name: pricing('professional.name'),
      price: '$99.99',
      description: pricing('professional.description'),
      features: [
        pricing('professional.features.pages'),
        pricing('professional.features.templates'),
        pricing('professional.features.keys'),
        pricing('professional.features.fileSize'),
        pricing('professional.features.support'),
        pricing('professional.features.branding'),
      ],
    },
    {
      id: 'enterprise',
      name: pricing('enterprise.name'),
      price: pricing('contactSales'),
      description: pricing('enterprise.description'),
      features: [
        pricing('enterprise.features.pages'),
        pricing('enterprise.features.templates'),
        pricing('enterprise.features.keys'),
        pricing('enterprise.features.fileSize'),
        pricing('enterprise.features.support'),
        pricing('enterprise.features.integrations'),
        pricing('enterprise.features.sla'),
      ],
    },
  ]

  const currentPlan = profile?.subscription?.plan || 'free'
  const hasStripeSubscription = !!profile?.subscription?.stripeCustomerId

  // Refresh profile on mount and periodically to catch subscription updates from webhooks
  useEffect(() => {
    // Invalidate cache on mount to get fresh data
    queryClient.invalidateQueries({ queryKey: ['profile'] })

    // Poll for updates every 5 seconds for 30 seconds after page load
    // This catches webhook updates that happen after Stripe checkout
    let pollCount = 0
    const maxPolls = 6
    const interval = setInterval(() => {
      pollCount++
      refetch()
      if (pollCount >= maxPolls) {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [queryClient, refetch])

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@mkpdfs.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }

    try {
      setLoadingPlan(planId)
      const { url } = await createCheckoutSession(planId)
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert(errors('generic'))
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true)
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert(errors('generic'))
    } finally {
      setLoadingPortal(false)
    }
  }

  const getPlanDisplayName = (plan: string) => {
    const planMap: Record<string, string> = {
      free: t('currentPlan.free'),
      starter: t('currentPlan.starter'),
      basic: t('currentPlan.starter'),
      professional: t('currentPlan.professional'),
      enterprise: t('currentPlan.enterprise'),
    }
    return planMap[plan] || plan
  }

  const getPlanPrice = (plan: string) => {
    const priceMap: Record<string, string> = {
      free: '$0',
      starter: '$29.99',
      basic: '$29.99',
      professional: '$99.99',
      enterprise: pricing('contactSales'),
    }
    return priceMap[plan] || '$0'
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
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            {t('currentPlan.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground-dark">
                {getPlanDisplayName(currentPlan)}
              </p>
              <p className="text-sm text-foreground-light">
                {getPlanPrice(currentPlan)}{common('perMonth')}
              </p>
            </div>
            <div className="flex gap-2">
              {hasStripeSubscription && (
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  {t('currentPlan.manage')}
                </Button>
              )}
              {currentPlan === 'free' && (
                <Button onClick={() => handleUpgrade('basic')}>
                  <Zap className="mr-2 h-4 w-4" />
                  {t('currentPlan.upgrade')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground-dark">{t('plans.title')}</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id ||
              (currentPlan === 'starter' && plan.id === 'basic')
            const isUpgrade = !isCurrent && plan.id !== 'free'

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      {pricing('mostPopular')}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground-dark">
                    {plan.price}
                    {plan.price !== pricing('contactSales') && (
                      <span className="text-sm font-normal text-foreground-light">{common('perMonth')}</span>
                    )}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-foreground-light">
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'secondary'}
                    disabled={isCurrent || plan.id === 'free' || loadingPlan === plan.id}
                    onClick={() => isUpgrade && handleUpgrade(plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isCurrent
                      ? t('plans.current')
                      : plan.id === 'free'
                        ? t('currentPlan.free')
                        : plan.price === pricing('contactSales')
                          ? pricing('contactSales')
                          : t('plans.select')}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
