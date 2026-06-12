'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Spinner } from '@/components/ui/Spinner'
import { X, Plus, Code, FileText, Check } from 'lucide-react'
import type { MarketplaceTemplate } from '@/types'
import { useMarketplaceTemplatePreview, useGeneratePdf } from '@/hooks/useApi'
import { getCategoryLabel } from './CategoryTabs'
import { useTranslations } from 'next-intl'

interface TemplatePreviewModalProps {
  template: MarketplaceTemplate | null
  onClose: () => void
  onUse: (template: MarketplaceTemplate) => void
  isUseLoading?: boolean
  isAdded?: boolean
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUse,
  isUseLoading,
  isAdded,
}: TemplatePreviewModalProps) {
  const t = useTranslations('marketplace.preview')
  const categoryT = useTranslations('marketplace.categories')
  const templatesT = useTranslations('marketplace.templates')

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'data'>('preview')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const { data: previewData, isLoading: isPreviewLoading } = useMarketplaceTemplatePreview(
    template?.templateId || ''
  )
  const generatePdf = useGeneratePdf()

  // Generate PDF preview when template content is loaded
  useEffect(() => {
    if (previewData?.content && template?.sampleDataJson) {
      setPdfUrl(null)
      // For preview, we'll show the template code since we can't generate PDF without saving
    }
  }, [previewData, template])

  if (!template) return null

  const sampleData = template.sampleDataJson ? JSON.parse(template.sampleDataJson) : {}

  // Get localized name and description, falling back to backend values
  const templateName = templatesT.has(`${template.templateId}.name`)
    ? templatesT(`${template.templateId}.name`)
    : template.name
  const templateDescription = templatesT.has(`${template.templateId}.description`)
    ? templatesT(`${template.templateId}.description`)
    : template.description

  const tabClass = (isActive: boolean) =>
    `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'border-[#8C6CFF] text-[#C9BBFF]'
        : 'border-transparent text-[#7E7E89] hover:text-[#F4F4F6]'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#101014] shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.015em] text-[#F4F4F6]">
              {templateName}
            </h2>
            <p className="mt-1.5 text-sm">
              <span className="rounded-full border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.13] px-2.5 py-0.5 text-xs font-medium text-[#B7A6FF]">
                {getCategoryLabel(template.category, categoryT)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#7E7E89] transition-colors hover:bg-white/[0.06] hover:text-[#F4F4F6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        {template.thumbnailUrl && (
          <div className="border-b border-white/[0.08] bg-black/30 px-6 py-4">
            <div className="relative mx-auto h-64 w-full max-w-xl">
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-lg object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] px-6">
          <button onClick={() => setActiveTab('preview')} className={tabClass(activeTab === 'preview')}>
            <FileText className="h-4 w-4" />
            {t('template')}
          </button>
          <button onClick={() => setActiveTab('data')} className={tabClass(activeTab === 'data')}>
            <Code className="h-4 w-4" />
            {t('sampleData')}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-auto p-6">
          {isPreviewLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" className="text-[#8C6CFF]" />
            </div>
          ) : activeTab === 'preview' ? (
            <div className="rounded-lg border border-white/[0.08] bg-black/40 p-4">
              <pre className="max-h-96 overflow-auto font-geist-mono text-[12.5px] leading-relaxed text-[#9C9CA8]">
                <code>{previewData?.content || t('loadingTemplate')}</code>
              </pre>
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.08] bg-black/40 p-4">
              <pre className="max-h-96 overflow-auto font-geist-mono text-[12.5px] leading-relaxed text-[#9C9CA8]">
                <code>{JSON.stringify(sampleData, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-white/[0.08] px-6 py-4">
          <p className="text-[13px] text-[#7E7E89]">{templateDescription}</p>
          {template.tags && template.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[5px] bg-white/[0.05] px-2 py-0.5 font-geist-mono text-[10.5px] text-[#6B6B76]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-[9px] border border-white/10 px-4 text-[13.5px] font-medium text-[#9C9CA8] transition-colors hover:bg-white/[0.05] hover:text-[#F4F4F6]"
          >
            {t('close')}
          </button>
          {isAdded ? (
            <button
              type="button"
              disabled
              className="flex h-9 items-center gap-1.5 rounded-[9px] border border-[#3FBF7F]/40 bg-[#3FBF7F]/[0.12] px-4 text-[13.5px] font-semibold text-[#7CF0B0]"
            >
              <Check className="h-4 w-4" strokeWidth={2.4} />
              {t('added')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUse(template)}
              disabled={isUseLoading}
              className="flex h-9 items-center gap-1.5 rounded-[9px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-4 text-[13.5px] font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUseLoading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.2} />
              )}
              {t('useTemplate')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
