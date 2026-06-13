import { getTranslations } from 'next-intl/server'
import { Lock, PanelsTopLeft } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export async function TwoWays() {
  const t = await getTranslations('marketing.twoWays')

  const chip =
    'rounded-full border border-ink/[0.08] bg-ink/[0.05] px-[11px] py-[5px] text-[12.5px] text-fg-muted'

  return (
    <section className="relative z-[1] mx-auto max-w-[1200px] px-7 pb-[90px] pt-[30px]">
      <ScrollReveal>
        <div className="mb-[50px] text-center">
          <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
            {t('eyebrow')}
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
            {t('title')}
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ScrollReveal>
          <div className="h-full rounded-[18px] border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(124,92,255,0.06),rgba(255,255,255,0))] p-8">
            <div className="mb-[18px] flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.16] text-brand-text">
                <Lock className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold">{t('s2sTitle')}</h3>
                <p className="mt-0.5 text-[13px] text-fg-dim">{t('s2sTagline')}</p>
              </div>
            </div>
            <p className="mb-[18px] text-[15px] leading-[1.6] text-fg-muted">{t('s2sBody')}</p>
            <div className="rounded-[11px] border border-ink/[0.08] bg-surface p-4 font-geist-mono text-[12.5px] leading-[1.7] text-fg-muted">
              <span className="text-fg-dim"># scoped, revocable token</span>
              <br />
              Authorization: Bearer <span className="text-brand-text">sk_live_4f8a…</span>
              <br />
              <span className="text-ok">→ 200</span>{' '}
              {'{ "url": "cdn.mkpdfs.com/…" }'}
            </div>
            <div className="mt-[18px] flex flex-wrap gap-2">
              <span className={chip}>{t('s2sChip1')}</span>
              <span className={chip}>{t('s2sChip2')}</span>
              <span className={chip}>{t('s2sChip3')}</span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="h-full rounded-[18px] border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] p-8">
            <div className="mb-[18px] flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-ink/[0.12] bg-ink/[0.06] text-fg-muted">
                <PanelsTopLeft className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold">{t('portalTitle')}</h3>
                <p className="mt-0.5 text-[13px] text-fg-dim">{t('portalTagline')}</p>
              </div>
            </div>
            <p className="mb-[18px] text-[15px] leading-[1.6] text-fg-muted">{t('portalBody')}</p>
            <div className="flex flex-col gap-2.5 rounded-[11px] border border-ink/[0.08] bg-surface p-4">
              <div className="flex items-center gap-[9px]">
                <span className="w-[74px] text-xs text-fg-dim">{t('mockTemplateLabel')}</span>
                <span className="flex h-[30px] flex-1 items-center rounded-[7px] border border-ink/10 bg-ink/[0.03] px-2.5 text-[12.5px] text-fg-muted">
                  {t('mockTemplateValue')}
                </span>
              </div>
              <div className="flex items-center gap-[9px]">
                <span className="w-[74px] text-xs text-fg-dim">{t('mockCustomerLabel')}</span>
                <span className="flex h-[30px] flex-1 items-center rounded-[7px] border border-ink/10 bg-ink/[0.03] px-2.5 text-[12.5px] text-fg-muted">
                  {t('mockCustomerValue')}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <span className="rounded-[7px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-3.5 py-[7px] text-[12.5px] font-semibold text-white">
                  {t('mockGenerate')}
                </span>
              </div>
            </div>
            <div className="mt-[18px] flex flex-wrap gap-2">
              <span className={chip}>{t('portalChip1')}</span>
              <span className={chip}>{t('portalChip2')}</span>
              <span className={chip}>{t('portalChip3')}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
