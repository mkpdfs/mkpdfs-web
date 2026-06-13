import { getTranslations } from 'next-intl/server'
import { LayoutGrid, Code, Download, type LucideIcon } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const STEP_ICONS: LucideIcon[] = [LayoutGrid, Code, Download]

export async function HowItWorks() {
  const t = await getTranslations('marketing.how')

  const steps = [1, 2, 3].map((n, i) => ({
    index: `0${n}`,
    title: t(`step${n}Title`),
    body: t(`step${n}Body`),
    Icon: STEP_ICONS[i],
  }))

  return (
    <section id="how" className="relative z-[1] mx-auto max-w-[1200px] scroll-mt-[68px] px-7 pb-[90px] pt-10">
      <ScrollReveal>
        <div className="mb-[58px] text-center">
          <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
            {t('eyebrow')}
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[540px] text-lg text-fg-muted">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <ScrollReveal key={step.index} delay={i * 100}>
            <div className="h-full rounded-2xl border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))] p-7">
              <div className="mb-[18px] font-geist-mono text-[13px] text-fg-faint">{step.index}</div>
              <div className="mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.14]">
                <step.Icon className="h-[22px] w-[22px] text-brand-text" strokeWidth={1.9} />
              </div>
              <h3 className="mb-2.5 text-xl font-semibold">{step.title}</h3>
              <p className="text-[15px] leading-[1.6] text-fg-muted">{step.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
