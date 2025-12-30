'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Eye, Plus, Download, Check } from 'lucide-react'
import type { MarketplaceTemplate } from '@/types'
import { getCategoryLabel } from './CategoryTabs'
import { useTranslations } from 'next-intl'

interface TemplateCardProps {
  template: MarketplaceTemplate
  onPreview: (template: MarketplaceTemplate) => void
  onUse: (template: MarketplaceTemplate) => void
  isLoading?: boolean
  isAdded?: boolean
}

export function TemplateCard({ template, onPreview, onUse, isLoading, isAdded }: TemplateCardProps) {
  const t = useTranslations('marketplace')
  const categoryT = useTranslations('marketplace.categories')

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        {/* Thumbnail or placeholder */}
        <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          {template.thumbnailUrl ? (
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <FileText className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {/* Template Info */}
        <h3 className="font-medium text-gray-900">{template.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {template.description}
        </p>

        {/* Category Badge */}
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
            {getCategoryLabel(template.category, categoryT)}
          </span>
          {template.popularity > 0 && (
            <span className="ml-2 inline-flex items-center text-xs text-gray-400">
              <Download className="mr-1 h-3 w-3" />
              {template.popularity}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPreview(template)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {t('card.preview')}
          </Button>
          {isAdded ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              disabled
            >
              <Check className="mr-1.5 h-4 w-4" />
              {t('card.used')}
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onUse(template)}
              disabled={isLoading}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t('card.use')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
