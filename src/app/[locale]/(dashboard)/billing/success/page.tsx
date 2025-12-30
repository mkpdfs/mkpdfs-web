'use client'

import { useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function BillingSuccessPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidate profile query to refresh subscription data
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }, [queryClient])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base">
            Thank you for upgrading your plan. Your new features are now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground-light">
            Your subscription has been activated and you now have access to all the features
            included in your new plan.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/billing">
                View Billing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
