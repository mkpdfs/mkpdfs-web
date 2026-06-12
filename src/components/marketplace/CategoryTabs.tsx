'use client'

import { useTranslations } from 'next-intl'

const categoryIds = ['all', 'business', 'certificates', 'marketing', 'personal'] as const
type CategoryId = (typeof categoryIds)[number]

interface CategoryTabsProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  const t = useTranslations('marketplace.categories')

  return (
    <div className="flex flex-wrap gap-2">
      {categoryIds.map((catId) => {
        const isActive = activeCategory === catId
        return (
          <button
            key={catId}
            type="button"
            onClick={() => onChange(catId)}
            className={
              isActive
                ? 'rounded-full border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.13] px-3.5 py-1.5 text-[13px] font-semibold text-[#C9BBFF]'
                : 'rounded-full border border-white/[0.09] bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-[#9C9CA8] transition-colors hover:border-white/20 hover:text-[#F4F4F6]'
            }
          >
            {t(catId)}
          </button>
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
