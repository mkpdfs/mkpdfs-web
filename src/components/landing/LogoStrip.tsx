import { getTranslations } from 'next-intl/server'

// Placeholder wordmarks — replace with real customer logos when available.
const WORDMARKS = ['Ledgerly', 'Northwind', 'Quanta', 'Briefcase', 'Outpost']

export async function LogoStrip() {
  const t = await getTranslations('marketing.logos')

  return (
    <section className="relative z-[1] mx-auto max-w-[1000px] px-7 pb-20 pt-[30px] text-center">
      <p className="mb-[22px] text-[12.5px] uppercase tracking-[0.1em] text-fg-faint">
        {t('title')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-[46px] gap-y-4">
        {WORDMARKS.map((name) => (
          <span
            key={name}
            className="text-xl font-bold tracking-[-0.02em] opacity-55 transition-opacity duration-300 hover:opacity-90"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
