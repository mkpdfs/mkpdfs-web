'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Key,
  Settings,
  CreditCard,
  FileText as Logo,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const common = useTranslations('common')

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('templates'), href: '/templates', icon: FileText },
    { name: t('generate'), href: '/generate', icon: Sparkles },
    { name: t('apiKeys'), href: '/api-keys', icon: Key },
  ]

  const secondaryNavigation = [
    { name: t('settings'), href: '/settings', icon: Settings },
    { name: t('billing'), href: '/billing', icon: CreditCard },
  ]

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-white px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground-dark">{common('brandName')}</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
