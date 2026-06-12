import { getTranslations } from 'next-intl/server'
import { FileText, Zap, Code, Shield, BarChart3, Users, type LucideIcon } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const FEATURES: { key: string; Icon: LucideIcon }[] = [
  { key: 'handlebars', Icon: FileText },
  { key: 'fast', Icon: Zap },
  { key: 'api', Icon: Code },
  { key: 'secure', Icon: Shield },
  { key: 'tracking', Icon: BarChart3 },
  { key: 'team', Icon: Users },
]

export async function FeaturesGrid() {
  const t = await getTranslations('marketing.features')

  return (
    <section
      id="features"
      className="relative z-[1] scroll-mt-[68px] border-y border-white/[0.06] bg-[linear-gradient(180deg,rgba(124,92,255,0.04),transparent)]"
    >
      <div className="mx-auto max-w-[1200px] px-7 py-[84px]">
        <ScrollReveal>
          <div className="mb-[50px] max-w-[620px]">
            <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
              {t('eyebrow')}
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-[#9C9CA8]">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[18px] border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">
            {FEATURES.map(({ key, Icon }) => (
              <div
                key={key}
                className="group bg-[#0A0A0C] p-[30px] transition-colors hover:bg-[#0E0E12]"
              >
                <div className="mb-4 text-[#B7A6FF]">
                  <Icon
                    className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t(`${key}Title`)}</h3>
                <p className="text-[14.5px] leading-[1.6] text-[#8E8E99]">{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
