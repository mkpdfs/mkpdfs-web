import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Upload } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { ContactLink } from './ContactLink'

// Visual identity per template (ids and colors are design constants, not copy).
const TEMPLATE_META = [
  { key: 'invoice', id: 'invoice', bg: 'linear-gradient(135deg,#1a1530,#0e0e14)', accent: '#8C6CFF' },
  { key: 'receipt', id: 'receipt', bg: 'linear-gradient(135deg,#102018,#0e0e14)', accent: '#3FBF7F' },
  { key: 'report', id: 'report', bg: 'linear-gradient(135deg,#101a26,#0e0e14)', accent: '#4F9BFF' },
  { key: 'certificate', id: 'certificate', bg: 'linear-gradient(135deg,#241a10,#0e0e14)', accent: '#E0A14F' },
  { key: 'contract', id: 'contract', bg: 'linear-gradient(135deg,#1c1422,#0e0e14)', accent: '#C06CFF' },
  { key: 'boarding', id: 'boarding', bg: 'linear-gradient(135deg,#101e22,#0e0e14)', accent: '#3FC9C9' },
  { key: 'statement', id: 'statement', bg: 'linear-gradient(135deg,#1a1018,#0e0e14)', accent: '#FF6C8C' },
  { key: 'quote', id: 'quote', bg: 'linear-gradient(135deg,#161a10,#0e0e14)', accent: '#9BCF3F' },
]

export async function TemplatesGallery() {
  const t = await getTranslations('marketing.templates')

  return (
    <section id="templates" className="relative z-[1] mx-auto max-w-[1200px] scroll-mt-[68px] px-7 py-[84px]">
      <ScrollReveal>
        <div className="mb-[42px] flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[600px]">
            <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
              {t('eyebrow')}
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-[#9C9CA8]">{t('subtitle')}</p>
          </div>
          <Link
            href="/register"
            className="flex items-center gap-[9px] whitespace-nowrap rounded-[10px] border border-white/[0.12] bg-white/[0.05] px-[18px] py-[11px] text-[14.5px] font-semibold text-[#F4F4F6] transition hover:bg-white/[0.09]"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            {t('upload')}
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATE_META.map((tpl, i) => (
          <ScrollReveal key={tpl.id} delay={(i % 4) * 80}>
            <div className="group cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0C0C0F] transition hover:-translate-y-[3px] hover:border-[#8C6CFF]/45">
              <div
                className="flex h-[150px] items-center justify-center border-b border-white/[0.06]"
                style={{ background: tpl.bg }}
              >
                <div className="flex h-[108px] w-[84px] flex-col gap-[5px] rounded-[5px] bg-white p-[11px] shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
                  <div className="h-[7px] w-[54%] rounded-sm" style={{ background: tpl.accent }} />
                  <div className="mt-[3px] h-[3px] w-[80%] rounded-sm bg-[#E2E2E8]" />
                  <div className="h-[3px] w-[64%] rounded-sm bg-[#E2E2E8]" />
                  <div className="mt-auto h-[3px] w-[74%] rounded-sm bg-[#ECECF0]" />
                  <div className="h-[3px] w-[44%] rounded-sm bg-[#ECECF0]" />
                </div>
              </div>
              <div className="px-4 py-[15px]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15.5px] font-semibold">{t(`items.${tpl.key}.name`)}</h3>
                  <span className="rounded-[5px] bg-white/[0.05] px-[7px] py-0.5 font-geist-mono text-[10.5px] text-[#6B6B76]">
                    {tpl.id}
                  </span>
                </div>
                <p className="mt-[7px] text-[13px] text-[#7E7E89]">{t(`items.${tpl.key}.desc`)}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-[22px] text-center text-[14.5px] text-[#7E7E89]">
        {t('footerPrefix')}{' '}
        <ContactLink className="font-semibold text-[#B7A6FF] hover:underline">
          {t('footerLink')}
        </ContactLink>
      </div>
    </section>
  )
}
