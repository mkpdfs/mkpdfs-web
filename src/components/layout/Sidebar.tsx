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
          ? 'border-[#8C6CFF]/[0.22] bg-[#8C6CFF]/[0.13] font-semibold text-[#C9BBFF]'
          : 'border-transparent font-medium text-[#9C9CA8] hover:bg-white/[0.04] hover:text-[#F4F4F6]'
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

  const balance = profile?.subscription?.creditBalance ?? 0
  const pagesLeft = Math.floor(balance / PRICE_PER_PAGE)
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
    <aside className="hidden w-[236px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0A0A0C] lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_4px_14px_rgba(124,92,255,0.35)]">
            <Logo className="h-[15px] w-[15px] text-white" strokeWidth={2.1} />
          </div>
          <span className="text-[16.5px] font-semibold tracking-[-0.02em] text-[#F4F4F6]">
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
      <div className="mt-auto flex flex-col gap-2.5 border-t border-white/[0.06] px-3 py-3.5">
        <div className="mx-2 rounded-[11px] border border-[#8C6CFF]/[0.22] bg-[#8C6CFF]/[0.08] px-3.5 py-[13px]">
          <div className="flex items-baseline justify-between">
            <span className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-[#9C9CA8]">
              {tp('credits')}
            </span>
            <span className="font-geist-mono text-[13px] font-semibold text-[#F4F4F6]">
              ${balance.toFixed(2)}
            </span>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-sm bg-white/[0.08]">
            <div
              className="h-full rounded-sm bg-[linear-gradient(90deg,#8C6CFF,#B7A6FF)]"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-[#7E7E89]">
            {tp('pagesLeft', { pages: pagesLeft.toLocaleString() })} ·{' '}
            <Link href="/billing" className="font-medium text-[#B7A6FF] hover:underline">
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
