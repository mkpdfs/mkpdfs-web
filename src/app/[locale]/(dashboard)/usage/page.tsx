'use client'

import { useTranslations } from 'next-intl'
import { useUsage } from '@/hooks/useApi'
import { Spinner } from '@/components/ui'
import { FileText } from 'lucide-react'

const PRICE_PER_PAGE = 0.01

const COLUMNS = ['document', 'template', 'source', 'status', 'pages', 'duration', 'when'] as const
const RIGHT_ALIGNED = new Set(['pages', 'duration', 'when'])

export default function UsagePage() {
  const t = useTranslations('usage.requests')
  const errors = useTranslations('errors')
  const { data: usage, isLoading, error } = useUsage()

  const pages = usage?.usage?.pagesGenerated ?? 0
  const spend = (pages * PRICE_PER_PAGE).toFixed(2)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('title')}</h1>
          {isLoading ? (
            <Spinner size="sm" />
          ) : error ? (
            <p className="text-[14.5px] text-destructive">{errors('generic')}</p>
          ) : (
            <p className="text-[14.5px] text-fg-muted">
              {t.rich('subtitle', {
                pages: () => (
                  <span className="font-geist-mono text-fg">
                    {t('pagesValue', { pages })}
                  </span>
                ),
                spend: () => <span className="font-geist-mono text-fg">${spend}</span>,
              })}
            </p>
          )}
        </div>
      </div>

      {/* Requests table */}
      <div className="overflow-hidden rounded-[14px] border border-ink/[0.09] bg-surface">
        <div className="hidden grid-cols-[2fr_1fr_1.3fr_0.9fr_0.7fr_0.9fr_1fr] items-center gap-3 border-b border-ink/[0.08] bg-ink/[0.02] px-[18px] py-[11px] md:grid">
          {COLUMNS.map((col) => (
            <span
              key={col}
              className={`font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim ${
                RIGHT_ALIGNED.has(col) ? 'text-right' : ''
              }`}
            >
              {t(`columns.${col}`)}
            </span>
          ))}
        </div>

        {/* Empty state — per-request history will populate once requests are logged */}
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[13px] border border-[#8C6CFF]/25 bg-[#8C6CFF]/[0.1] text-brand-text">
            <FileText className="h-[22px] w-[22px]" strokeWidth={1.7} />
          </div>
          <h2 className="mb-1.5 text-base font-semibold">{t('empty.title')}</h2>
          <p className="max-w-[380px] text-[13.5px] text-fg-muted">{t('empty.body')}</p>
        </div>

        <div className="flex items-center justify-between border-t border-ink/[0.05] px-[18px] py-3">
          <span className="text-[12.5px] text-fg-dim">{t('footer.count', { count: 0 })}</span>
          <span className="font-geist-mono text-xs text-fg-faint">{t('footer.retention')}</span>
        </div>
      </div>
    </div>
  )
}
