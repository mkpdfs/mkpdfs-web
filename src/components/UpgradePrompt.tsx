'use client'

import { Link } from '@/i18n/routing'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UpgradePromptProps {
  feature: string
}

/** Shown when a feature needs a positive credit balance (credits model). */
export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const common = useTranslations('common')

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/[0.15] px-8 py-16 text-center">
      <div className="mb-[18px] flex h-14 w-14 items-center justify-center rounded-[15px] border border-[#8C6CFF]/25 bg-[#8C6CFF]/[0.1] text-brand-text">
        <Lock className="h-[26px] w-[26px]" strokeWidth={1.7} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-fg">{feature}</h3>
      <p className="mb-6 max-w-[400px] text-[14.5px] text-fg-muted">
        {common('creditsRequired')}
      </p>
      <Link
        href="/billing"
        className="inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)]"
      >
        {common('buyCredits')}
      </Link>
    </div>
  )
}
