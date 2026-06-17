'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { BrandingWizardBody } from '@/components/theme/BrandingWizardBody'
import { useCopyMarketplaceTemplate, useMarketplaceTemplatePreview } from '@/hooks/useApi'
import { draftToThemeInput, type WizardDraft } from '@/lib/theme/draft'
import { toast } from '@/hooks/useToast'
import { useApiError } from '@/hooks/useApiError'

export default function MarketplaceCustomizePage() {
  const params = useParams()
  const templateId = params.templateId as string
  const t = useTranslations('branding')
  const tMarketplace = useTranslations('marketplace')
  const router = useRouter()
  const notifyApiError = useApiError()

  const [isApplying, setIsApplying] = useState(false)

  const { data: preview, isLoading } = useMarketplaceTemplatePreview(templateId)

  const copyTemplate = useCopyMarketplaceTemplate()

  let sampleData: Record<string, unknown> = {}
  try {
    sampleData = preview?.sampleDataJson ? JSON.parse(preview.sampleDataJson) : {}
  } catch {
    sampleData = {}
  }

  const handleApply = async (draft: WizardDraft | null) => {
    setIsApplying(true)
    try {
      const theme = draft ? await draftToThemeInput(draft) : undefined
      await copyTemplate.mutateAsync({ templateId, theme })
      toast({
        title: tMarketplace('useSuccess'),
        description: preview?.name ? `"${preview.name}" has been added to your templates.` : undefined,
      })
      router.push('/templates')
    } catch (err) {
      notifyApiError(err, { title: tMarketplace('useError') })
    } finally {
      setIsApplying(false)
    }
  }

  const handleCancel = () => {
    router.push('/marketplace')
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-4 border-b border-border px-6 py-4">
        <Link
          href="/marketplace"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold tracking-[-0.015em] text-fg">
          {t('adoptTitle')}
          {preview?.name && (
            <span className="ml-2 text-base font-normal text-fg-muted">— {preview.name}</span>
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
          mode="adopt"
          templateContent={preview?.content ?? ''}
          sampleData={sampleData}
          isSubmitting={isApplying}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
