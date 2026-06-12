'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Code } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'

// "See how it works" → 22s explainer video (self-contained HTML in public/,
// played in an iframe; mounts on open so it restarts every time).
export function ExplainerModal() {
  const t = useTranslations('marketing.hero')
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-[9px] rounded-[11px] border border-white/[0.12] bg-white/[0.05] px-6 py-3.5 text-[15.5px] font-semibold text-[#F4F4F6] transition hover:bg-white/[0.09] active:scale-[0.98]"
      >
        <Code
          className="h-4 w-4 text-[#B7A6FF] transition-transform group-hover:scale-110"
          strokeWidth={2}
        />
        {t('ctaSecondary')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-[1080px] gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#08080A] p-0 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
          <DialogTitle className="sr-only">{t('ctaSecondary')}</DialogTitle>
          <iframe
            src="/explainer.html"
            title="mkpdfs explainer"
            className="aspect-video w-full overflow-hidden border-0"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
