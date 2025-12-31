'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{templateName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                {getCategoryLabel(template.category, categoryT)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        {template.thumbnailUrl && (
          <div className="border-b bg-muted px-6 py-4">
            <div className="relative mx-auto h-64 w-full max-w-xl">
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-lg object-contain shadow-sm"
                priority
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            {t('template')}
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="h-4 w-4" />
            {t('sampleData')}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-auto p-6">
          {isPreviewLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : activeTab === 'preview' ? (
            <div className="rounded-lg border bg-muted p-4">
              <pre className="max-h-96 overflow-auto text-sm">
                <code>{previewData?.content || t('loadingTemplate')}</code>
              </pre>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted p-4">
              <pre className="max-h-96 overflow-auto text-sm">
                <code>{JSON.stringify(sampleData, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t bg-muted px-6 py-4">
          <p className="text-sm text-muted-foreground">{templateDescription}</p>
          {template.tags && template.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          {isAdded ? (
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              disabled
            >
              <Check className="mr-1.5 h-4 w-4" />
              {t('added')}
            </Button>
          ) : (
            <Button onClick={() => onUse(template)} disabled={isUseLoading}>
              {isUseLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              {t('useTemplate')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
