'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/providers'
import { cn } from '@/lib/utils'
import { Button, LanguageSelector } from '@/components/ui'
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Sparkles,
  Key,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  User,
  FileText as Logo,
  Store,
  Wand2,
  Code,
} from 'lucide-react'

const navigationItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'myTemplates', href: '/templates', icon: FileText },
  { key: 'aiGenerate', href: '/ai-generate', icon: Wand2 },
  { key: 'generate', href: '/generate', icon: Sparkles },
  { key: 'integration', href: '/integration', icon: Code },
  { key: 'apiKeys', href: '/api-keys', icon: Key },
  { key: 'usage', href: '/usage', icon: BarChart3 },
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'billing', href: '/billing', icon: CreditCard },
]

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-foreground-light lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />

        {/* User menu */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <LanguageSelector variant="default" className="hidden sm:block" />

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-foreground-light hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">{t('signOut')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-foreground-dark/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-white px-6 py-6 sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Logo className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground-dark">mkpdfs</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6">
              <ul role="list" className="-mx-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary'
                            : 'text-foreground-light hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-primary' : 'text-foreground-light group-hover:text-foreground'
                          )}
                        />
                        {t(item.key)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="mt-6 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="mt-4">
                <LanguageSelector variant="default" className="w-full justify-center" />
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
