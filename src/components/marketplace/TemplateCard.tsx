'use client'

import Image from 'next/image'
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
  const templatesT = useTranslations('marketplace.templates')

  // Get localized name and description, falling back to backend values
  const templateName = templatesT.has(`${template.templateId}.name`)
    ? templatesT(`${template.templateId}.name`)
    : template.name
  const templateDescription = templatesT.has(`${template.templateId}.description`)
    ? templatesT(`${template.templateId}.description`)
    : template.description

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        {/* Thumbnail or placeholder */}
        <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
          {template.thumbnailUrl ? (
            <Image
              src={template.thumbnailUrl}
              alt={template.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Template Info */}
        <h3 className="font-medium text-gray-900">{templateName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {templateDescription}
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
