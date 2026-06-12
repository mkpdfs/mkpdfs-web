'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth, useTheme } from '@/providers'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Key,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  FileText as Logo,
  Store,
  Sparkles,
  Code,
} from 'lucide-react'

const navigationItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'myTemplates', href: '/templates', icon: FileText },
  { key: 'aiGenerate', href: '/ai-generate', icon: Sparkles },
  { key: 'integration', href: '/integration', icon: Code },
  { key: 'apiKeys', href: '/api-keys', icon: Key },
  { key: 'usage', href: '/usage', icon: BarChart3 },
  { key: 'billing', href: '/billing', icon: CreditCard },
  { key: 'settings', href: '/settings', icon: Settings },
]

const ghostControl =
  'flex h-[34px] items-center justify-center gap-[7px] rounded-[9px] border border-white/10 bg-transparent text-[13px] font-medium text-[#9C9CA8] transition-colors hover:bg-white/[0.05] hover:text-[#F4F4F6]'

function PortalLanguageSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(ghostControl, 'px-3')}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-[15px] w-[15px]" strokeWidth={1.9} />
        {locale.toUpperCase()}
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] rounded-[10px] border border-white/10 bg-[#101014] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              role="option"
              aria-selected={loc === locale}
              onClick={() => {
                router.replace(pathname, { locale: loc })
                setIsOpen(false)
              }}
              className={cn(
                'flex w-full items-center px-3 py-2 text-[13px] transition-colors',
                loc === locale
                  ? 'font-semibold text-[#C9BBFF]'
                  : 'text-[#9C9CA8] hover:bg-white/[0.05] hover:text-[#F4F4F6]'
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

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')

  const initial = (user?.name || user?.email || 'M').charAt(0).toUpperCase()

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-white/[0.07] px-4 sm:px-7">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2 p-2 text-[#9C9CA8] hover:text-[#F4F4F6] lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          title="Theme"
          onClick={toggleTheme}
          className={cn(ghostControl, 'hidden w-[34px] sm:flex')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" strokeWidth={1.9} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.9} />
          )}
        </button>
        <div className="hidden sm:block">
          <PortalLanguageSelector />
        </div>
        <div className="mx-1.5 hidden h-5 w-px bg-white/10 sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-[13px] font-semibold text-white">
            {initial}
          </div>
          <button type="button" onClick={signOut} className={cn(ghostControl, 'px-3')}>
            <LogOut className="h-4 w-4 sm:hidden" strokeWidth={1.9} />
            <span className="hidden sm:inline">{t('signOut')}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto border-r border-white/[0.07] bg-[#0A0A0C] px-5 py-5">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)]">
                  <Logo className="h-[15px] w-[15px] text-white" strokeWidth={2.1} />
                </div>
                <span className="text-[16.5px] font-semibold tracking-[-0.02em] text-[#F4F4F6]">
                  mkpdfs
                </span>
              </Link>
              <button
                type="button"
                className="-m-2 rounded-md p-2 text-[#9C9CA8] hover:text-[#F4F4F6]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-0.5">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-[11px] rounded-[9px] border px-3 py-[9px] text-sm transition-colors',
                      isActive
                        ? 'border-[#8C6CFF]/[0.22] bg-[#8C6CFF]/[0.13] font-semibold text-[#C9BBFF]'
                        : 'border-transparent font-medium text-[#9C9CA8] hover:bg-white/[0.04] hover:text-[#F4F4F6]'
                    )}
                  >
                    <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
                    {t(item.key)}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-5">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-[13px] font-semibold text-white">
                {initial}
              </div>
              <PortalLanguageSelector />
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut()
                }}
                className={cn(ghostControl, 'ml-auto px-3')}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
