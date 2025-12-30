'use client'

import { useRouter } from 'next/navigation'
import { AIGenerateSection } from '@/components/templates/AIGenerateSection'
import { useTranslations } from 'next-intl'

export default function AIGeneratePage() {
  const router = useRouter()
  const t = useTranslations('aiGenerate')

  const handleSaveComplete = () => {
    router.push('/templates')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-dark">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-light">
          {t('subtitle')}
        </p>
      </div>

      {/* AI Generate Section */}
      <AIGenerateSection onSaveComplete={handleSaveComplete} />
    </div>
  )
}
