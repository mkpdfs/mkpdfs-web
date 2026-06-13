import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { FileText } from 'lucide-react'
import { ContactLink } from './ContactLink'

export async function LandingFooter() {
  const t = await getTranslations('marketing.footer')

  const linkClass = 'text-sm text-fg-muted transition-colors hover:text-fg'
  const colTitleClass = 'mb-[3px] text-[12.5px] uppercase tracking-[0.08em] text-fg-faint'

  return (
    <footer className="relative z-[1] border-t border-ink/[0.07]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-10 px-7 py-12">
        <div className="max-w-[280px]">
          <div className="mb-3.5 flex items-center gap-[11px]">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)]">
              <FileText className="h-[15px] w-[15px] text-white" strokeWidth={2.1} />
            </div>
            <span className="text-[17px] font-semibold">mkpdfs</span>
          </div>
          <p className="text-sm leading-[1.6] text-fg-dim">{t('tagline')}</p>
        </div>

        <div className="flex flex-wrap gap-16">
          <div className="flex flex-col gap-[11px]">
            <span className={colTitleClass}>{t('product')}</span>
            <a href="#features" className={linkClass}>{t('features')}</a>
            <a href="#templates" className={linkClass}>{t('templates')}</a>
            <a href="#pricing" className={linkClass}>{t('pricing')}</a>
          </div>
          <div className="flex flex-col gap-[11px]">
            <span className={colTitleClass}>{t('developers')}</span>
            <Link href="/integration" className={linkClass}>{t('documentation')}</Link>
            <Link href="/integration" className={linkClass}>{t('apiReference')}</Link>
          </div>
          <div className="flex flex-col gap-[11px]">
            <span className={colTitleClass}>{t('company')}</span>
            <ContactLink className={`${linkClass} text-left`}>{t('contact')}</ContactLink>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-7 py-[22px]">
          <span className="text-[13px] text-fg-faint">
            {t('copyright', { year: new Date().getFullYear() })}
          </span>
          <span className="font-geist-mono text-xs text-fg-faint">{t('operational')}</span>
        </div>
      </div>
    </footer>
  )
}
