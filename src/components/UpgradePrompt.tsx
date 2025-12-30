'use client'

import { Link } from '@/i18n/routing'
import { Lock } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface UpgradePromptProps {
  feature: string
  requiredPlan?: 'starter' | 'professional' | 'enterprise'
}

export function UpgradePrompt({ feature, requiredPlan = 'starter' }: UpgradePromptProps) {
  const t = useTranslations('billing')
  const common = useTranslations('common')

  const planNames: Record<string, string> = {
    starter: t('currentPlan.starter'),
    professional: t('currentPlan.professional'),
    enterprise: t('currentPlan.enterprise'),
  }

  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground-dark mb-2">
          {feature}
        </h3>
        <p className="text-sm text-foreground-light mb-4">
          {common('upgradeRequired', { plan: planNames[requiredPlan] })}
        </p>
        <Button asChild>
          <Link href="/billing">{common('upgradeNow')}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
