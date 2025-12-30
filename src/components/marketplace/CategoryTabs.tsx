'use client'

import { Button } from '@/components/ui/Button'
import { Briefcase, Award, Megaphone, User, LayoutGrid } from 'lucide-react'

const categories = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'personal', label: 'Personal', icon: User },
]

interface CategoryTabsProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = activeCategory === cat.id
        return (
          <Button
            key={cat.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(cat.id)}
            className={isActive ? '' : 'hover:bg-gray-100'}
          >
            <Icon className="mr-1.5 h-4 w-4" />
            {cat.label}
          </Button>
        )
      })}
    </div>
  )
}

export function getCategoryLabel(category: string): string {
  const cat = categories.find((c) => c.id === category)
  return cat?.label || category
}
