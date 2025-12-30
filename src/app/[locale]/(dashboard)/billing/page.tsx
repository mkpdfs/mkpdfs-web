'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { CreditCard, Check, Zap, Loader2, ExternalLink } from 'lucide-react'
import { useProfile } from '@/hooks/useApi'
import { createCheckoutSession, createPortalSession } from '@/lib/api'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'For hobbyists and testing',
    features: [
      '100 PDFs per month',
      '5 templates',
      '1 API key',
      '10MB max file size',
      'Email support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$29.99',
    description: 'For small projects',
    features: [
      '1,000 PDFs per month',
      '50 templates',
      '3 API keys',
      '25MB max file size',
      'Priority email support',
    ],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99.99',
    description: 'For growing businesses',
    features: [
      '10,000 PDFs per month',
      '500 templates',
      '10 API keys',
      '50MB max file size',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited PDFs',
      'Unlimited templates',
      'Unlimited API keys',
      '100MB max file size',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
]

export default function BillingPage() {
  const { data: profile, isLoading } = useProfile()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  const currentPlan = profile?.subscription?.plan || 'free'
  const hasStripeSubscription = !!profile?.subscription?.stripeCustomerId

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
      alert('Failed to start checkout. Please try again.')
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
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoadingPortal(false)
    }
  }

  const getPlanDisplayName = (plan: string) => {
    const planMap: Record<string, string> = {
      free: 'Free',
      starter: 'Basic',
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
    }
    return planMap[plan] || plan
  }

  const getPlanPrice = (plan: string) => {
    const priceMap: Record<string, string> = {
      free: '$0',
      starter: '$29.99',
      basic: '$29.99',
      professional: '$99.99',
      enterprise: 'Custom',
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
        <h1 className="text-2xl font-bold text-foreground-dark">Billing</h1>
        <p className="mt-1 text-sm text-foreground-light">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground-dark">
                {getPlanDisplayName(currentPlan)}
              </p>
              <p className="text-sm text-foreground-light">
                {getPlanPrice(currentPlan)}/month
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
                  Manage Subscription
                </Button>
              )}
              {currentPlan === 'free' && (
                <Button onClick={() => handleUpgrade('basic')}>
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground-dark">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      Popular
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
                    {plan.price !== 'Custom' && (
                      <span className="text-sm font-normal text-foreground-light">/month</span>
                    )}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground-light">
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
                      ? 'Current Plan'
                      : plan.id === 'free'
                        ? 'Free Tier'
                        : plan.price === 'Custom'
                          ? 'Contact Sales'
                          : 'Upgrade'}
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
