'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { X, Plus, Code, FileText } from 'lucide-react'
import type { MarketplaceTemplate } from '@/types'
import { useMarketplaceTemplatePreview, useGeneratePdf } from '@/hooks/useApi'
import { getCategoryLabel } from './CategoryTabs'

interface TemplatePreviewModalProps {
  template: MarketplaceTemplate | null
  onClose: () => void
  onUse: (template: MarketplaceTemplate) => void
  isUseLoading?: boolean
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUse,
  isUseLoading,
}: TemplatePreviewModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                {getCategoryLabel(template.category)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Template
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="h-4 w-4" />
            Sample Data
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-auto p-6">
          {isPreviewLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : activeTab === 'preview' ? (
            <div className="rounded-lg border bg-gray-50 p-4">
              <pre className="max-h-96 overflow-auto text-sm">
                <code>{previewData?.content || 'Loading template...'}</code>
              </pre>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-4">
              <pre className="max-h-96 overflow-auto text-sm">
                <code>{JSON.stringify(sampleData, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <p className="text-sm text-gray-600">{template.description}</p>
          {template.tags && template.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
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
            Close
          </Button>
          <Button onClick={() => onUse(template)} disabled={isUseLoading}>
            {isUseLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            Add to My Templates
          </Button>
        </div>
      </div>
    </div>
  )
}
