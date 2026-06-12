import { getTranslations } from 'next-intl/server'
import { Lock, PanelsTopLeft } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export async function TwoWays() {
  const t = await getTranslations('marketing.twoWays')

  const chip =
    'rounded-full border border-white/[0.08] bg-white/[0.05] px-[11px] py-[5px] text-[12.5px] text-[#A0A0AB]'

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
          <div className="h-full rounded-[18px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(124,92,255,0.06),rgba(255,255,255,0))] p-8">
            <div className="mb-[18px] flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.16] text-[#B7A6FF]">
                <Lock className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold">{t('s2sTitle')}</h3>
                <p className="mt-0.5 text-[13px] text-[#7E7E89]">{t('s2sTagline')}</p>
              </div>
            </div>
            <p className="mb-[18px] text-[15px] leading-[1.6] text-[#9C9CA8]">{t('s2sBody')}</p>
            <div className="rounded-[11px] border border-white/[0.08] bg-[#0A0A0C] p-4 font-geist-mono text-[12.5px] leading-[1.7] text-[#C9C9D2]">
              <span className="text-[#7C7C86]"># scoped, revocable token</span>
              <br />
              Authorization: Bearer <span className="text-[#B7A6FF]">sk_live_4f8a…</span>
              <br />
              <span className="text-[#7CF0B0]">→ 200</span>{' '}
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
          <div className="h-full rounded-[18px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] p-8">
            <div className="mb-[18px] flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-white/[0.12] bg-white/[0.06] text-[#D8D8E0]">
                <PanelsTopLeft className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold">{t('portalTitle')}</h3>
                <p className="mt-0.5 text-[13px] text-[#7E7E89]">{t('portalTagline')}</p>
              </div>
            </div>
            <p className="mb-[18px] text-[15px] leading-[1.6] text-[#9C9CA8]">{t('portalBody')}</p>
            <div className="flex flex-col gap-2.5 rounded-[11px] border border-white/[0.08] bg-[#0A0A0C] p-4">
              <div className="flex items-center gap-[9px]">
                <span className="w-[74px] text-xs text-[#7E7E89]">{t('mockTemplateLabel')}</span>
                <span className="flex h-[30px] flex-1 items-center rounded-[7px] border border-white/10 bg-white/[0.03] px-2.5 text-[12.5px] text-[#D8D8E0]">
                  {t('mockTemplateValue')}
                </span>
              </div>
              <div className="flex items-center gap-[9px]">
                <span className="w-[74px] text-xs text-[#7E7E89]">{t('mockCustomerLabel')}</span>
                <span className="flex h-[30px] flex-1 items-center rounded-[7px] border border-white/10 bg-white/[0.03] px-2.5 text-[12.5px] text-[#D8D8E0]">
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
