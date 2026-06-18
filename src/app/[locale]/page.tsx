import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { locales } from '@/i18n/config'
import {
  OG_IMAGE,
  TWITTER_CARD,
  localizedUrl,
  ogLocaleFor,
  languageAlternates,
} from '@/lib/seo'
import {
  LandingNav,
  LandingHero,
  Terminal,
  LogoStrip,
  HowItWorks,
  FeaturesGrid,
  TemplatesGallery,
  TwoWays,
  PricingCredits,
  FinalCta,
  LandingFooter,
} from '@/components/landing'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const title = t('title')
  const description = t('description')
  const canonical = localizedUrl(locale)

  return {
    // absolute: the message already starts with "mkpdfs", so bypass the
    // "%s | mkpdfs" template to avoid "mkpdfs … | mkpdfs" on the homepage.
    title: { absolute: title },
    description,
    alternates: { canonical, languages: languageAlternates() },
    openGraph: {
      type: 'website',
      siteName: 'mkpdfs',
      title,
      description,
      url: canonical,
      locale: ogLocaleFor(locale),
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocaleFor(l)),
      images: [OG_IMAGE],
    },
    twitter: { card: TWITTER_CARD, title, description, images: [OG_IMAGE.url] },
  }
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div
      className={`${GeistSans.variable} ${GeistMono.variable} mk-landing relative min-h-screen overflow-x-hidden bg-surface font-geist text-fg`}
    >
      {/* ambient violet glow + faint grid, masked from the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-220px] z-0 h-[600px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:64px_64px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000,transparent_75%)]"
      />

      <LandingNav />
      <main>
        <LandingHero />
        <Terminal />
        <LogoStrip />
        <HowItWorks />
        <FeaturesGrid />
        <TemplatesGallery />
        <TwoWays />
        <PricingCredits />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
