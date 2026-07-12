'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { useProfile } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Key,
  CreditCard,
  FileText as Logo,
  Store,
  Sparkles,
  Code,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

const PRICE_PER_PAGE = 0.01
const STANDARD_PACK = 10

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-[11px] rounded-[9px] border px-3 py-[9px] text-sm transition-colors',
        active
          ? 'border-[#8C6CFF]/[0.22] bg-[#8C6CFF]/[0.13] font-semibold text-brand-strong'
          : 'border-transparent font-medium text-fg-muted hover:bg-ink/[0.04] hover:text-fg'
      )}
    >
      <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tp = useTranslations('portal')
  const common = useTranslations('common')
  const { data: profile } = useProfile()

  // creditBalance is in CREDITS (1 credit = 1 page), not dollars.
  const balance = profile?.subscription?.creditBalance ?? 0
  const balanceUsd = balance * PRICE_PER_PAGE
  const pagesLeft = Math.max(0, Math.floor(balance))
  const barPct = Math.max(0, Math.min(100, (balance / STANDARD_PACK) * 100))

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('marketplace'), href: '/marketplace', icon: Store },
    { name: t('myTemplates'), href: '/templates', icon: FileText },
    { name: t('aiGenerate'), href: '/ai-generate', icon: Sparkles },
    { name: t('integration'), href: '/integration', icon: Code },
    { name: t('apiKeys'), href: '/api-keys', icon: Key },
    { name: t('usage'), href: '/usage', icon: BarChart3 },
  ]

  const secondaryNavigation = [
    { name: t('billing'), href: '/billing', icon: CreditCard },
    { name: t('settings'), href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden w-[236px] shrink-0 flex-col border-r border-ink/[0.07] bg-surface lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] shadow-[0_0_0_1px_rgb(var(--ink)/0.12),0_4px_14px_rgba(124,92,255,0.35)]">
            <Logo className="h-[15px] w-[15px] text-white" strokeWidth={2.1} />
          </div>
          <span className="text-[16.5px] font-semibold tracking-[-0.02em] text-fg">
            {common('brandName')}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-1.5">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      {/* Bottom: credits widget + billing */}
      <div className="mt-auto flex flex-col gap-2.5 border-t border-ink/[0.06] px-3 py-3.5">
        <div className="mx-2 rounded-[11px] border border-[#8C6CFF]/[0.22] bg-[#8C6CFF]/[0.08] px-3.5 py-[13px]">
          <div className="flex items-baseline justify-between">
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">
              {tp('credits')}
            </span>
            <span className="font-geist-mono text-[13px] font-semibold text-fg">
              ${balanceUsd.toFixed(2)}
            </span>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-sm bg-ink/[0.08]">
            <div
              className="h-full rounded-sm bg-[linear-gradient(90deg,#8C6CFF,#B7A6FF)]"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-fg-dim">
            {tp('pagesLeft', { pages: pagesLeft.toLocaleString() })} ·{' '}
            <Link href="/billing" className="font-medium text-brand-text hover:underline">
              {tp('topUp')}
            </Link>
          </div>
        </div>
        {secondaryNavigation.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
          />
        ))}
      </div>
    </aside>
  )
}
