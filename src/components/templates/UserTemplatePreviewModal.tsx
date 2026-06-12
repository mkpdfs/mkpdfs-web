'use client'

import Image from 'next/image'
import { Spinner } from '@/components/ui/Spinner'
import { X, FileText, Trash2, Code } from 'lucide-react'
import type { Template } from '@/types'
import { useTemplate } from '@/hooks/useApi'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'

interface UserTemplatePreviewModalProps {
  template: Template | null
  onClose: () => void
  onDelete: (template: Template) => void
  isDeleteLoading?: boolean
}

export function UserTemplatePreviewModal({
  template,
  onClose,
  onDelete,
  isDeleteLoading,
}: UserTemplatePreviewModalProps) {
  const t = useTranslations('templates')
  const common = useTranslations('common')

  const { data: templateWithContent, isLoading } = useTemplate(template?.id || '')

  if (!template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#101014] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-[-0.015em] text-[#F4F4F6]">
              {template.name}
            </h2>
            <p className="mt-1 font-geist-mono text-[12.5px] text-[#7E7E89]">
              {formatDate(template.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-[#7E7E89] transition-colors hover:bg-white/[0.06] hover:text-[#F4F4F6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="border-b border-white/[0.08] bg-white/[0.02] px-6 py-4">
          <div className="relative mx-auto h-64 w-full max-w-xl">
            {template.thumbnailUrl ? (
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-[10px] object-contain"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[linear-gradient(140deg,rgba(124,92,255,0.12),rgba(124,92,255,0.02))]">
                <FileText className="h-16 w-16 text-[#B7A6FF]/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        {/* Template Code Section */}
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-[#B7A6FF]" strokeWidth={1.8} />
            <span className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-[#9C9CA8]">
              {t('preview.templateCode')}
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-[10px] border border-white/[0.08] bg-[#0C0C0F]">
              <Spinner size="lg" className="text-[#8C6CFF]" />
            </div>
          ) : (
            <div className="rounded-[10px] border border-white/[0.08] bg-[#0C0C0F] p-4">
              <pre className="max-h-64 overflow-auto font-geist-mono text-[12.5px] leading-relaxed text-[#9C9CA8]">
                <code>{templateWithContent?.content || t('preview.loadingTemplate')}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <div className="border-t border-white/[0.08] bg-white/[0.02] px-6 py-4">
            <p className="text-sm text-[#9C9CA8]">{template.description}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-6 py-4">
          <button
            onClick={() => onDelete(template)}
            disabled={isDeleteLoading}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,108,140,0.35)] bg-[rgba(255,108,140,0.1)] px-[18px] text-sm font-semibold text-[#FF8A9B] transition-colors hover:bg-[rgba(255,108,140,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleteLoading ? (
              <Spinner size="sm" className="text-[#FF8A9B]" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t('card.delete')}
          </button>
          <button
            onClick={onClose}
            className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-[18px] text-sm font-semibold text-[#F4F4F6] transition-colors hover:bg-white/[0.08]"
          >
            {common('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
