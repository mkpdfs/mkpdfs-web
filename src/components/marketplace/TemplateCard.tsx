'use client'

import Image from 'next/image'
import { Spinner } from '@/components/ui/Spinner'
import { Check } from 'lucide-react'
import type { MarketplaceTemplate } from '@/types'
import { useTranslations } from 'next-intl'

interface TemplateCardProps {
  template: MarketplaceTemplate
  onPreview: (template: MarketplaceTemplate) => void
  onUse: (template: MarketplaceTemplate) => void
  isLoading?: boolean
  isAdded?: boolean
}

export function TemplateCard({ template, onPreview, onUse, isLoading, isAdded }: TemplateCardProps) {
  const t = useTranslations('marketplace')
  const templatesT = useTranslations('marketplace.templates')

  // Get localized name and description, falling back to backend values
  const templateName = templatesT.has(`${template.templateId}.name`)
    ? templatesT(`${template.templateId}.name`)
    : template.name
  const templateDescription = templatesT.has(`${template.templateId}.description`)
    ? templatesT(`${template.templateId}.description`)
    : template.description

  return (
    <div className="group flex flex-col overflow-hidden rounded-[14px] border border-ink/[0.09] bg-surface-raised transition-all hover:-translate-y-0.5 hover:border-[#8C6CFF]/45">
      {/* Preview area */}
      <div className="relative flex h-32 shrink-0 items-center justify-center border-b border-ink/[0.06] bg-[linear-gradient(160deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))]">
        {template.thumbnailUrl ? (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[92px] w-[72px] flex-col gap-1 rounded-[5px] bg-white p-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
            <div className="h-1.5 w-[54%] rounded-[2px] bg-[#8C6CFF]" />
            <div className="mt-0.5 h-[3px] w-[80%] rounded-[2px] bg-[#E2E2E8]" />
            <div className="h-[3px] w-[64%] rounded-[2px] bg-[#E2E2E8]" />
            <div className="mt-auto h-[3px] w-[74%] rounded-[2px] bg-[#ECECF0]" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="mb-[5px] flex items-center justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-fg">{templateName}</span>
          <span className="max-w-[45%] shrink-0 truncate rounded-[5px] bg-ink/[0.05] px-[7px] py-0.5 font-geist-mono text-[10.5px] text-fg-dim">
            {template.templateId}
          </span>
        </div>
        <p className="mb-3.5 line-clamp-2 text-[13px] text-fg-dim">{templateDescription}</p>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          {isAdded ? (
            <button
              type="button"
              disabled
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-ok/40 bg-ok/[0.12] text-[13px] font-semibold text-ok"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
              {t('card.used')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUse(template)}
              disabled={isLoading}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#8C6CFF]/35 bg-[#8C6CFF]/[0.13] text-[13px] font-semibold text-brand-strong transition-colors hover:bg-[#8C6CFF]/[0.22] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Spinner size="sm" className="text-brand-strong" />}
              {t('card.useTemplate')}
            </button>
          )}
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="h-8 rounded-lg border border-ink/10 px-3 text-[13px] font-medium text-fg-muted transition-colors hover:bg-ink/[0.05] hover:text-fg"
          >
            {t('card.preview')}
          </button>
        </div>
      </div>
    </div>
  )
}
