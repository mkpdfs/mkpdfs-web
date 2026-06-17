'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { BrandingWizardBody } from '@/components/theme/BrandingWizardBody'
import { useTemplate, useUpdateTemplateTheme, useMarketplaceTemplatePreview } from '@/hooks/useApi'
import { draftToThemeInput, type WizardDraft } from '@/lib/theme/draft'
import { toast } from '@/hooks/useToast'

export default function TemplateBrandingPage() {
  const params = useParams()
  const templateId = params.templateId as string
  const t = useTranslations('branding')
  const tTemplates = useTranslations('templates')
  const router = useRouter()

  const [isApplying, setIsApplying] = useState(false)

  const { data: tpl, isLoading: tplLoading } = useTemplate(templateId)
  const sourceId = tpl?.sourceMarketplaceId ?? ''
  const { data: preview, isLoading: previewLoading } = useMarketplaceTemplatePreview(sourceId)

  const updateTheme = useUpdateTemplateTheme()

  let sampleData: Record<string, unknown> = {}
  try {
    sampleData = preview?.sampleDataJson ? JSON.parse(preview.sampleDataJson) : {}
  } catch {
    sampleData = {}
  }

  const isLoading = tplLoading || (!!sourceId && previewLoading)

  const initialTheme = tpl?.theme
    ? { brand: tpl.theme.brand, accent: tpl.theme.accent, fontKey: tpl.theme.fontKey }
    : undefined

  const handleApply = async (draft: WizardDraft | null) => {
    if (!draft) return
    setIsApplying(true)
    try {
      const theme = await draftToThemeInput(draft)
      await updateTheme.mutateAsync({ templateId, theme })
      toast({ title: tTemplates('preview.editBrandingSuccess') })
      router.push('/templates')
    } catch (err) {
      toast({
        title: tTemplates('preview.editBrandingError'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleCancel = () => {
    router.push('/templates')
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-4 border-b border-border px-6 py-4">
        <Link
          href="/templates"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold tracking-[-0.015em] text-fg">
          {t('editTitle')}
          {tpl?.name && (
            <span className="ml-2 text-base font-normal text-fg-muted">— {tpl.name}</span>
          )}
        </h1>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-[#8C6CFF]" />
        </div>
      ) : (
        <BrandingWizardBody
          mode="edit"
          templateContent={tpl?.content ?? ''}
          sampleData={sampleData}
          initialTheme={initialTheme}
          existingLogoKey={tpl?.theme?.logoKey}
          isSubmitting={isApplying}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
