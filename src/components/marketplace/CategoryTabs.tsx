'use client'

import { Button } from '@/components/ui/Button'
import { Briefcase, Award, Megaphone, User, LayoutGrid } from 'lucide-react'
import { useTranslations } from 'next-intl'

const categoryIds = ['all', 'business', 'certificates', 'marketing', 'personal'] as const
type CategoryId = (typeof categoryIds)[number]

const categoryIcons: Record<CategoryId, typeof LayoutGrid> = {
  all: LayoutGrid,
  business: Briefcase,
  certificates: Award,
  marketing: Megaphone,
  personal: User,
}

interface CategoryTabsProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  const t = useTranslations('marketplace.categories')

  return (
    <div className="flex flex-wrap gap-2">
      {categoryIds.map((catId) => {
        const Icon = categoryIcons[catId]
        const isActive = activeCategory === catId
        return (
          <Button
            key={catId}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(catId)}
            className={isActive ? '' : 'hover:bg-muted'}
          >
            <Icon className="mr-1.5 h-4 w-4" />
            {t(catId)}
          </Button>
        )
      })}
    </div>
  )
}

export function getCategoryLabel(category: string, t: (key: string) => string): string {
  if (categoryIds.includes(category as CategoryId)) {
    return t(category)
  }
  return category
}
