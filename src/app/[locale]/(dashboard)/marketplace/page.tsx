'use client'

import { useState, useMemo } from 'react'
import { useMarketplaceTemplates, useCopyMarketplaceTemplate, useTemplates } from '@/hooks/useApi'
import { Card, CardContent, Spinner, Input } from '@/components/ui'
import { CategoryTabs, TemplateCard, TemplatePreviewModal } from '@/components/marketplace'
import { toast } from '@/hooks/useToast'
import { Search, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { MarketplaceTemplate } from '@/types'

export default function MarketplacePage() {
  const t = useTranslations('marketplace')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null)

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
    try {
      await copyTemplate.mutateAsync(template.templateId)
      toast({
        title: t('useSuccess'),
        description: `"${template.name}" has been added to your templates.`,
      })
      setPreviewTemplate(null)
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
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground-dark">
          <Store className="h-6 w-6" />
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-foreground-light">{t('subtitle')}</p>
      </div>

      {/* Category Tabs */}
      <CategoryTabs activeCategory={category} onChange={setCategory} />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{errors('generic')}</p>
          </CardContent>
        </Card>
      ) : filteredTemplates?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-foreground-dark">{t('empty')}</h3>
            <p className="mt-2 text-sm text-foreground-light">
              {searchQuery ? t('emptySearch') : t('emptyDefault')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates?.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              onPreview={setPreviewTemplate}
              onUse={handleUseTemplate}
              isLoading={copyTemplate.isPending}
              isAdded={addedMarketplaceIds.has(template.templateId)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
        isUseLoading={copyTemplate.isPending}
        isAdded={previewTemplate ? addedMarketplaceIds.has(previewTemplate.templateId) : false}
      />
    </div>
  )
}
