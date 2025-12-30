'use client'

import { Link } from '@/i18n/routing'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-10 w-10 text-foreground-light" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-base">
            Your payment was not processed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground-light">
            If you encountered any issues during checkout or have questions about our plans,
            please don&apos;t hesitate to contact our support team.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/billing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Billing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="mailto:support@mkpdfs.com">
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
