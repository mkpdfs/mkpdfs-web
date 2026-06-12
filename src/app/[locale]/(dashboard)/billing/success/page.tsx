'use client'

import { useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function BillingSuccessPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidate profile query to refresh subscription data
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }, [queryClient])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] px-8 py-9 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#3FBF7F]/35 bg-[#3FBF7F]/[0.12]">
          <CheckCircle className="h-7 w-7 text-[#7CF0B0]" strokeWidth={1.9} />
        </div>
        <h1 className="mb-2 text-[22px] font-bold tracking-[-0.02em]">Payment Successful!</h1>
        <p className="mb-3 text-[14.5px] text-[#9C9CA8]">
          Thank you for upgrading your plan. Your new features are now active.
        </p>
        <p className="mb-7 text-[13px] text-[#7E7E89]">
          Your subscription has been activated and you now have access to all the features included
          in your new plan.
        </p>
        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)]"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/billing"
            className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-[18px] text-sm font-medium text-[#F4F4F6] transition-colors hover:border-white/25"
          >
            View Billing
          </Link>
        </div>
      </div>
    </div>
  )
}
