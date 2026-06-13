import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { ExplainerModal } from './ExplainerModal'

export async function LandingHero() {
  const t = await getTranslations('marketing.hero')

  return (
    <header className="relative z-[1] mx-auto max-w-[1080px] px-7 pb-10 pt-16 text-center md:pt-24">
      <div className="mk-rise" style={{ '--mk-delay': '0.05s' } as React.CSSProperties}>
        <a
          href="#pricing"
          className="group mb-[34px] inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-ink/[0.04] py-1.5 pl-3.5 pr-1.5 text-[13px] text-fg-muted transition-colors hover:border-[#8C6CFF]/50"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_8px_rgb(var(--ok))] [animation:mk-pulse_2s_infinite]" />
          <span>{t('badge')}</span>
          <span className="rounded-full bg-ink/[0.08] px-[9px] py-0.5 text-xs text-fg-muted transition-colors group-hover:bg-[#8C6CFF]/20 group-hover:text-brand-strong">
            {t('badgeCta')}
          </span>
        </a>
      </div>

      <h1
        className="mk-rise mb-6 text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-[72px]"
        style={{ '--mk-delay': '0.12s' } as React.CSSProperties}
      >
        {t('title1')}
        <br />
        <span className="bg-[linear-gradient(110deg,#C9BBFF,#8C6CFF_30%,#6C8CFF_50%,#8C6CFF_70%,#C9BBFF)] bg-[length:250%_100%] bg-clip-text text-transparent [animation:mk-gradient-shift_7s_ease-in-out_infinite]">
          {t('title2')}
        </span>
      </h1>

      <p
        className="mk-rise mx-auto mb-[38px] max-w-[600px] text-lg leading-[1.55] text-fg-muted md:text-xl"
        style={{ '--mk-delay': '0.2s' } as React.CSSProperties}
      >
        {t('subtitle')}
      </p>

      <div
        className="mk-rise mb-[18px] flex flex-wrap justify-center gap-3.5"
        style={{ '--mk-delay': '0.3s' } as React.CSSProperties}
      >
        <Link
          href="/register"
          className="group flex items-center gap-[9px] rounded-[11px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[26px] py-3.5 text-[15.5px] font-semibold text-white shadow-[0_8px_28px_rgba(124,92,255,0.4),inset_0_1px_0_rgb(var(--ink)/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(124,92,255,0.55)] active:translate-y-0 active:scale-[0.98]"
        >
          {t('ctaPrimary')}{' '}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <ExplainerModal />
      </div>
      <p
        className="mk-rise text-[13.5px] text-fg-dim"
        style={{ '--mk-delay': '0.4s' } as React.CSSProperties}
      >
        {t('microcopy')}
      </p>
    </header>
  )
}
