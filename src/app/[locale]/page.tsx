import { setRequestLocale } from 'next-intl/server'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
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
