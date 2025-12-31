'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { Globe, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-foreground-light hover:text-foreground hover:bg-muted',
          isOpen && 'bg-muted text-foreground'
        )}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        {variant === 'default' && (
          <>
            <span>{localeNames[locale]}</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              role="option"
              aria-selected={loc === locale}
              onClick={() => handleLocaleChange(loc)}
              className={cn(
                'flex w-full items-center px-3 py-2 text-sm transition-colors',
                loc === locale
                  ? 'bg-primary-50 text-primary font-medium'
                  : 'text-foreground-light hover:bg-muted hover:text-foreground'
              )}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
