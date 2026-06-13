import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { ScrollReveal } from './ScrollReveal'
import { ContactLink } from './ContactLink'

export async function PricingCredits() {
  const t = await getTranslations('marketing.pricing')

  const bullets = [t('bullet1'), t('bullet2'), t('bullet3'), t('bullet4')]

  return (
    <section
      id="pricing"
      className="relative z-[1] scroll-mt-[68px] border-t border-ink/[0.06] bg-[linear-gradient(180deg,rgba(124,92,255,0.05),transparent)]"
    >
      <div className="mx-auto max-w-[1200px] px-7 py-[84px]">
        <ScrollReveal>
          <div className="text-center">
            <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
              {t('eyebrow')}
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
              {t('title')}
            </h2>
            <p className="mx-auto max-w-[560px] text-lg text-fg-muted">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mx-auto mt-10 max-w-[560px] rounded-[18px] border border-[#8C6CFF]/35 bg-[linear-gradient(180deg,rgba(124,92,255,0.1),rgba(255,255,255,0.01))] p-[34px] text-center shadow-[0_30px_70px_-30px_rgba(124,92,255,0.4)]">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-[64px] font-bold leading-none tracking-[-0.04em]">$10</span>
              <span className="text-lg text-fg-muted">{t('ofCredits')}</span>
            </div>
            <div className="mt-3 text-[17px] text-fg-muted">
              ≈ <strong className="text-white">{t('approxPages')}</strong> ·{' '}
              <span className="text-ok">{t('perPage')}</span>
            </div>
            <div className="my-6 h-px bg-ink/[0.08]" />
            <div className="flex flex-col gap-[11px] text-left">
              {bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-2.5 text-[14.5px] text-fg-muted">
                  <span className="text-ok">✓</span> {bullet}
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="group mt-[26px] flex items-center justify-center gap-[9px] rounded-[11px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] p-3.5 text-[15.5px] font-semibold text-white shadow-[0_8px_24px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(124,92,255,0.55)] active:translate-y-0 active:scale-[0.99]"
            >
              {t('cta')}{' '}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-5 text-center text-[13.5px] text-fg-dim">
          {t('enterprisePrefix')}{' '}
          <ContactLink className="text-brand-text hover:underline">
            {t('enterpriseLink')}
          </ContactLink>
        </div>
      </div>
    </section>
  )
}
