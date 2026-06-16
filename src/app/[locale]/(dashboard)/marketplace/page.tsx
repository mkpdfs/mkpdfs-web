'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useMarketplaceTemplates, useCopyMarketplaceTemplate, useTemplates } from '@/hooks/useApi'
import { Spinner } from '@/components/ui'
import { CategoryTabs, TemplateCard, TemplatePreviewModal } from '@/components/marketplace'
import { ContactLink } from '@/components/landing'
import { toast } from '@/hooks/useToast'
import { getMarketplaceTemplatePreview } from '@/lib/api'
import { draftToThemeInput, type WizardDraft } from '@/lib/theme/draft'
import { Search, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { MarketplaceTemplate } from '@/types'

const BrandingWizardModal = dynamic(
  () => import('@/components/theme/BrandingWizardModal').then((m) => m.BrandingWizardModal),
  { ssr: false }
)

export default function MarketplacePage() {
  const t = useTranslations('marketplace')
  const errors = useTranslations('errors')

  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null)
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null)
  const [wizard, setWizard] = useState<{ templateId: string; name: string; content: string; sampleData: Record<string, unknown> } | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const { data: templates, isLoading, error } = useMarketplaceTemplates(category)
  const { data: userTemplates } = useTemplates()
  const copyTemplate = useCopyMarketplaceTemplate()

  // Build a set of marketplace template IDs that the user has already added
  const addedMarketplaceIds = useMemo(() => {
    if (!userTemplates) return new Set<string>()
    return new Set(
      userTemplates
        .filter((t) => t.sourceMarketplaceId)
        .map((t) => t.sourceMarketplaceId!)
    )
  }, [userTemplates])

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleUseTemplate = async (template: MarketplaceTemplate) => {
    setLoadingTemplateId(template.templateId)
    try {
      const preview = await getMarketplaceTemplatePreview(template.templateId)
      let sampleData: Record<string, unknown> = {}
      try { sampleData = preview.sampleDataJson ? JSON.parse(preview.sampleDataJson) : {} } catch { sampleData = {} }
      setWizard({ templateId: template.templateId, name: template.name, content: preview.content ?? '', sampleData })
      setPreviewTemplate(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : errors('generic')
      toast({
        title: t('useError'),
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoadingTemplateId(null)
    }
  }

  const onApply = async (draft: WizardDraft | null) => {
    if (!wizard) return
    setIsApplying(true)
    try {
      const theme = draft ? await draftToThemeInput(draft) : undefined
      await copyTemplate.mutateAsync({ templateId: wizard.templateId, theme })
      toast({
        title: t('useSuccess'),
        description: `"${wizard.name}" has been added to your templates.`,
      })
      setWizard(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : errors('generic')
      if (errorMessage.includes('limit')) {
        toast({
          title: t('limitReached'),
          description: errorMessage,
          variant: 'destructive',
        })
      } else {
        toast({
          title: t('useError'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('pageTitle')}</h1>
          <p className="text-[14.5px] text-fg-muted">{t('pageSubtitle')}</p>
        </div>
        <div className="relative w-full min-w-[260px] sm:w-auto">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-fg-dim"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[38px] w-full rounded-[10px] border border-ink/10 bg-ink/[0.03] pl-9 pr-3.5 text-[13.5px] text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-[#8C6CFF]/50 sm:w-[280px]"
          />
        </div>
      </div>

      {/* Category chips */}
      <CategoryTabs activeCategory={category} onChange={setCategory} />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" className="text-[#8C6CFF]" />
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-ink/[0.09] bg-surface-raised py-12 text-center">
          <p className="text-[14px] text-fg-muted">{errors('generic')}</p>
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-ink/[0.12] py-12 text-center">
          <h3 className="text-[15px] font-semibold text-fg">{t('empty')}</h3>
          <p className="mt-2 text-[13.5px] text-fg-muted">
            {searchQuery ? t('emptySearch') : t('emptyDefault')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates?.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              onPreview={setPreviewTemplate}
              onUse={handleUseTemplate}
              isLoading={loadingTemplateId === template.templateId}
              isAdded={addedMarketplaceIds.has(template.templateId)}
            />
          ))}

          {/* Request a custom template */}
          <ContactLink className="flex min-h-[248px] flex-col items-center justify-center gap-2.5 rounded-[14px] border border-dashed border-[#8C6CFF]/40 p-7 text-center transition-colors hover:bg-[#8C6CFF]/5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.14] text-brand-text">
              <Plus className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-[14.5px] font-semibold text-fg">{t('request.title')}</span>
            <span className="text-[13px] text-fg-dim">{t('request.subtitle')}</span>
          </ContactLink>
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
        isUseLoading={previewTemplate ? loadingTemplateId === previewTemplate.templateId : false}
        isAdded={previewTemplate ? addedMarketplaceIds.has(previewTemplate.templateId) : false}
      />

      {/* Branding Wizard Modal */}
      {wizard && (
        <BrandingWizardModal
          open={!!wizard}
          mode="adopt"
          templateContent={wizard.content}
          sampleData={wizard.sampleData}
          isSubmitting={isApplying}
          onApply={onApply}
          onClose={() => setWizard(null)}
        />
      )}
    </div>
  )
}
