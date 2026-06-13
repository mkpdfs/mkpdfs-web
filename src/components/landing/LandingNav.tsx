import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { FileText } from 'lucide-react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export async function LandingNav() {
  const t = await getTranslations('marketing.nav')
  const nav = await getTranslations('nav')

  const links = [
    { href: '#how', label: t('howItWorks') },
    { href: '#templates', label: t('templates') },
    { href: '#features', label: nav('features') },
    { href: '#pricing', label: nav('pricing') },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-ink/[0.07] bg-surface/70 backdrop-blur-[14px]">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-7">
        <Link href="/" className="flex items-center gap-[11px]">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] shadow-[0_0_0_1px_rgb(var(--ink)/0.12),0_4px_16px_rgba(124,92,255,0.4)]">
            <FileText className="h-4 w-4 text-white" strokeWidth={2.1} />
          </div>
          <span className="text-lg font-semibold tracking-[-0.02em]">mkpdfs</span>
        </Link>

        <div className="hidden items-center gap-[34px] lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-[18px]">
          <ThemeToggle />
          <LanguageSelector variant="compact" />
          <Link
            href="/login"
            className="hidden text-[14.5px] font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {nav('signIn')}
          </Link>
          <Link
            href="/register"
            className="group flex items-center gap-[7px] whitespace-nowrap rounded-[9px] bg-fg px-4 py-[9px] text-sm font-semibold text-surface transition hover:-translate-y-px hover:bg-fg active:translate-y-0 active:scale-[0.98]"
          >
            {nav('getStarted')}{' '}
            <span className="opacity-50 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
