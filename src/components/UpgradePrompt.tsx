'use client'

import { Link } from '@/i18n/routing'
import { Lock } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface UpgradePromptProps {
  feature: string
}

/** Shown when a feature needs a positive credit balance (credits model). */
export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const common = useTranslations('common')

  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground-dark mb-2">
          {feature}
        </h3>
        <p className="text-sm text-foreground-light mb-4">
          {common('creditsRequired')}
        </p>
        <Button asChild>
          <Link href="/billing">{common('buyCredits')}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
