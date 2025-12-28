'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { CreditCard, Check, Zap } from 'lucide-react'

const plans = [
  {
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
    current: true,
  },
  {
    name: 'Starter',
    price: '$29',
    description: 'For small projects',
    features: [
      '1,000 PDFs per month',
      '50 templates',
      '3 API keys',
      '25MB max file size',
      'Priority email support',
    ],
    current: false,
    popular: true,
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'For growing businesses',
    features: [
      '10,000 PDFs per month',
      '500 templates',
      '10 API keys',
      '50MB max file size',
      'Priority support',
      'Custom branding',
    ],
    current: false,
  },
  {
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
    current: false,
  },
]

export default function BillingPage() {
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
              <p className="text-2xl font-bold text-foreground-dark">Free</p>
              <p className="text-sm text-foreground-light">$0/month</p>
            </div>
            <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground-dark">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
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
                  variant={plan.current ? 'outline' : plan.popular ? 'default' : 'secondary'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
