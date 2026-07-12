import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { FileText } from 'lucide-react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/**
 * Top navigation for the docs section. Mirrors LandingNav's visual language
 * but with docs-appropriate links (LandingNav's #anchor links only work on
 * the landing page).
 */
export async function DocsNav() {
  const nav = await getTranslations('nav')

  return (
    <nav className="sticky top-0 z-50 border-b border-ink/[0.07] bg-surface/70 backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-[11px]">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] shadow-[0_0_0_1px_rgb(var(--ink)/0.12),0_4px_16px_rgba(124,92,255,0.4)]">
              <FileText className="h-4 w-4 text-white" strokeWidth={2.1} />
            </div>
            <span className="text-lg font-semibold tracking-[-0.02em]">mkpdfs</span>
          </Link>
          <span className="hidden text-[13px] font-medium uppercase tracking-[0.08em] text-fg-dim sm:inline">
            Docs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#pricing"
            className="hidden text-[14px] font-medium text-fg-muted transition-colors hover:text-fg md:inline"
          >
            {nav('pricing')}
          </Link>
          <ThemeToggle />
          <LanguageSelector variant="compact" />
          <Link
            href="/login"
            className="hidden text-[14px] font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {nav('signIn')}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-4 py-2 text-[13.5px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0"
          >
            {nav('dashboard')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
