'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { ColorField } from './ColorField'
import { FontSelect } from './FontSelect'
import { LogoInput } from './LogoInput'
import { ThemedPreview } from './ThemedPreview'
import { DEFAULT_FONT_KEY } from '@/lib/theme/fonts'
import type { ThemeInput } from '@/types'
import type { LogoDraft, WizardDraft } from '@/lib/theme/draft'

const HEX_RE = /^#[0-9a-fA-F]{6}$/
const DEFAULT_BRAND = '#8C6CFF'
const DEFAULT_ACCENT = '#8C6CFF'

export interface BrandingWizardBodyProps {
  mode: 'adopt' | 'edit'
  templateContent: string
  sampleData: Record<string, unknown>
  initialTheme?: { brand: string; accent: string; fontKey: string }
  existingLogoKey?: string
  isSubmitting?: boolean
  onApply: (draft: WizardDraft | null) => void
  onCancel: () => void
}

export function BrandingWizardBody({
  mode,
  templateContent,
  sampleData,
  initialTheme,
  existingLogoKey,
  isSubmitting = false,
  onApply,
  onCancel,
}: BrandingWizardBodyProps) {
  const t = useTranslations('branding')

  const [brand, setBrand] = useState(initialTheme?.brand ?? DEFAULT_BRAND)
  const [accent, setAccent] = useState(initialTheme?.accent ?? DEFAULT_ACCENT)
  const [fontKey, setFontKey] = useState(initialTheme?.fontKey ?? DEFAULT_FONT_KEY)
  const [logo, setLogo] = useState<LogoDraft>(
    existingLogoKey ? { kind: 'existing', s3Key: existingLogoKey } : null
  )

  const bothColorsValid = HEX_RE.test(brand) && HEX_RE.test(accent)
  const disabled = !bothColorsValid || isSubmitting

  const previewTheme: ThemeInput = { brand, accent, fontKey }
  const logoPreviewUrl =
    logo?.kind === 'upload'
      ? logo.previewUrl
      : logo?.kind === 'url'
      ? logo.url
      : null

  const handleUseAsIs = () => {
    onApply(null)
  }

  const handleApplyWithTheme = () => {
    onApply({ brand, accent, fontKey, logo })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Two-pane body */}
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        {/* Left panel — controls */}
        <div className="flex w-full flex-col gap-5 overflow-y-auto border-b border-border p-6 sm:w-80 sm:flex-shrink-0 sm:border-b-0 sm:border-r">
          <ColorField label={t('brandColor')} value={brand} onChange={setBrand} />
          <ColorField label={t('accentColor')} value={accent} onChange={setAccent} />
          <FontSelect value={fontKey} onChange={setFontKey} />
          <LogoInput value={logo} onChange={setLogo} mode={mode} />
        </div>

        {/* Right panel — preview */}
        <div className="relative flex min-h-[400px] flex-1 flex-col bg-muted/30 sm:min-h-0">
          <div className="flex-shrink-0 border-b border-border bg-muted/50 px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">{t('preview')}</p>
          </div>
          <ThemedPreview
            templateContent={templateContent}
            sampleData={sampleData}
            theme={previewTheme}
            logoPreviewUrl={logoPreviewUrl}
            className="h-full w-full flex-1 border-0"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        {mode === 'adopt' ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseAsIs}
              disabled={disabled}
              isLoading={isSubmitting}
            >
              {t('useAsIs')}
            </Button>
            <Button
              type="button"
              onClick={handleApplyWithTheme}
              disabled={disabled}
              isLoading={isSubmitting}
              className="bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] transition-all hover:-translate-y-px"
            >
              {t('applyTheme')}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleApplyWithTheme}
              disabled={disabled}
              isLoading={isSubmitting}
              className="bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-white shadow-[0_6px_20px_rgba(124,92,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] transition-all hover:-translate-y-px"
            >
              {t('apply')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
