import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { ScrollReveal } from './ScrollReveal'

export async function FinalCta() {
  const t = await getTranslations('marketing.cta')

  return (
    <section className="relative z-[1] mx-auto max-w-[1200px] px-7 py-[90px]">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-[linear-gradient(140deg,#15101F,#0B0B10)] px-10 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[400px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.3),transparent_65%)]" />
          <div className="relative">
            <h2 className="mb-[18px] text-4xl font-bold tracking-[-0.035em] text-white md:text-[50px] md:leading-tight">
              {t('title')}
            </h2>
            <p className="mx-auto mb-8 max-w-[520px] text-[19px] text-white/65">{t('subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <Link
                href="/register"
                className="group flex items-center gap-[9px] rounded-[11px] bg-white px-7 py-3.5 text-[15.5px] font-semibold text-[#0B0B10] transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 active:scale-[0.98]"
              >
                {t('primary')}{' '}
                <span className="opacity-50 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/integration"
                className="flex items-center gap-[9px] rounded-[11px] border border-white/15 bg-white/10 px-[26px] py-3.5 text-[15.5px] font-semibold text-white transition hover:bg-white/20"
              >
                {t('docs')}
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
