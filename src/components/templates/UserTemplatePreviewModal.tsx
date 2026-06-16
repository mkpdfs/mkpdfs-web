'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/Spinner'
import { X, FileText, Trash2, Code, Palette } from 'lucide-react'
import type { Template } from '@/types'
import { useTemplate, useUpdateTemplateTheme } from '@/hooks/useApi'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { draftToThemeInput, type WizardDraft } from '@/lib/theme/draft'
import { getMarketplaceTemplatePreview } from '@/lib/api'

const BrandingWizardModal = dynamic(
  () => import('@/components/theme/BrandingWizardModal').then((m) => m.BrandingWizardModal),
  { ssr: false }
)

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

  const [editOpen, setEditOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [sampleData, setSampleData] = useState<Record<string, unknown> | null>(null)

  const { data: templateWithContent, isLoading } = useTemplate(template?.id || '')
  const updateTheme = useUpdateTemplateTheme()

  if (!template) return null

  const handleEditBranding = async () => {
    // Fetch sample data from marketplace source if available
    if (template.sourceMarketplaceId && sampleData === null) {
      try {
        const preview = await getMarketplaceTemplatePreview(template.sourceMarketplaceId)
        let parsed: Record<string, unknown> = {}
        try { parsed = preview.sampleDataJson ? JSON.parse(preview.sampleDataJson) : {} } catch { parsed = {} }
        setSampleData(parsed)
      } catch {
        setSampleData({})
      }
    } else if (!template.sourceMarketplaceId && sampleData === null) {
      setSampleData({})
    }
    setEditOpen(true)
  }

  const onApply = async (draft: WizardDraft | null) => {
    if (!draft) return
    setIsApplying(true)
    try {
      const theme = await draftToThemeInput(draft)
      await updateTheme.mutateAsync({ templateId: template.id, theme })
      toast({ title: t('preview.editBrandingSuccess') })
      setEditOpen(false)
    } catch (e) {
      toast({
        title: t('preview.editBrandingError'),
        description: (e as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }

  const initialTheme = template.theme
    ? { brand: template.theme.brand, accent: template.theme.accent, fontKey: template.theme.fontKey }
    : undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-ink/10 bg-surface-card shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/[0.08] px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-[-0.015em] text-fg">
              {template.name}
            </h2>
            <p className="mt-1 font-geist-mono text-[12.5px] text-fg-dim">
              {formatDate(template.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="border-b border-ink/[0.08] bg-ink/[0.02] px-6 py-4">
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
                <FileText className="h-16 w-16 text-brand-text/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        {/* Template Code Section */}
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-brand-text" strokeWidth={1.8} />
            <span className="font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted">
              {t('preview.templateCode')}
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-[10px] border border-ink/[0.08] bg-surface-raised">
              <Spinner size="lg" className="text-[#8C6CFF]" />
            </div>
          ) : (
            <div className="rounded-[10px] border border-ink/[0.08] bg-surface-raised p-4">
              <pre className="max-h-64 overflow-auto font-geist-mono text-[12.5px] leading-relaxed text-fg-muted">
                <code>{templateWithContent?.content || t('preview.loadingTemplate')}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <div className="border-t border-ink/[0.08] bg-ink/[0.02] px-6 py-4">
            <p className="text-sm text-fg-muted">{template.description}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-ink/[0.08] px-6 py-4">
          <button
            onClick={() => onDelete(template)}
            disabled={isDeleteLoading}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-danger-soft/35 bg-danger-soft/[0.1] px-[18px] text-sm font-semibold text-danger-soft transition-colors hover:bg-danger-soft/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleteLoading ? (
              <Spinner size="sm" className="text-danger-soft" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t('card.delete')}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEditBranding}
              className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-brand-text/25 bg-brand-text/[0.07] px-[18px] text-sm font-semibold text-brand-text transition-colors hover:bg-brand-text/[0.13]"
            >
              <Palette className="h-4 w-4" />
              {t('preview.editBranding')}
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-ink/[0.12] bg-ink/[0.04] px-[18px] text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.08]"
            >
              {common('close')}
            </button>
          </div>
        </div>
      </div>

      {/* Branding Wizard Modal */}
      {editOpen && (
        <BrandingWizardModal
          open={editOpen}
          mode="edit"
          templateContent={templateWithContent?.content ?? ''}
          sampleData={sampleData ?? {}}
          initialTheme={initialTheme}
          existingLogoKey={template.theme?.logoKey}
          isSubmitting={isApplying}
          onApply={onApply}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}
