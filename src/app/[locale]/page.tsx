import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import {
  FileText,
  Zap,
  Code2,
  Shield,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  Github,
} from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('landing')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')

  const features = [
    {
      name: t('features.handlebars.name'),
      description: t('features.handlebars.description'),
      icon: FileText,
    },
    {
      name: t('features.fast.name'),
      description: t('features.fast.description'),
      icon: Zap,
    },
    {
      name: t('features.api.name'),
      description: t('features.api.description'),
      icon: Code2,
    },
    {
      name: t('features.secure.name'),
      description: t('features.secure.description'),
      icon: Shield,
    },
    {
      name: t('features.analytics.name'),
      description: t('features.analytics.description'),
      icon: BarChart3,
    },
    {
      name: t('features.team.name'),
      description: t('features.team.description'),
      icon: Users,
    },
  ]

  const plans = [
    {
      name: t('pricing.free.name'),
      price: '$0',
      description: t('pricing.free.description'),
      features: [
        t('pricing.free.features.pages'),
        t('pricing.free.features.templates'),
        t('pricing.free.features.keys'),
        t('pricing.free.features.fileSize'),
        t('pricing.free.features.support'),
      ],
    },
    {
      name: t('pricing.starter.name'),
      price: '$29',
      description: t('pricing.starter.description'),
      features: [
        t('pricing.starter.features.pages'),
        t('pricing.starter.features.templates'),
        t('pricing.starter.features.keys'),
        t('pricing.starter.features.fileSize'),
        t('pricing.starter.features.support'),
      ],
      popular: true,
    },
    {
      name: t('pricing.professional.name'),
      price: '$99',
      description: t('pricing.professional.description'),
      features: [
        t('pricing.professional.features.pages'),
        t('pricing.professional.features.templates'),
        t('pricing.professional.features.keys'),
        t('pricing.professional.features.fileSize'),
        t('pricing.professional.features.support'),
        t('pricing.professional.features.branding'),
      ],
    },
    {
      name: t('pricing.enterprise.name'),
      price: t.raw('pricing.enterprise.name') === 'Enterprise' ? 'Custom' : 'Personalizado',
      description: t('pricing.enterprise.description'),
      features: [
        t('pricing.enterprise.features.pages'),
        t('pricing.enterprise.features.templates'),
        t('pricing.enterprise.features.keys'),
        t('pricing.enterprise.features.fileSize'),
        t('pricing.enterprise.features.support'),
        t('pricing.enterprise.features.integrations'),
        t('pricing.enterprise.features.sla'),
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground-dark">{common('brandName')}</span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            <a href="#features" className="text-sm font-medium text-foreground-light hover:text-foreground">
              {nav('features')}
            </a>
            <a href="#pricing" className="text-sm font-medium text-foreground-light hover:text-foreground">
              {nav('pricing')}
            </a>
            <a href="https://docs.mkpdfs.com" className="text-sm font-medium text-foreground-light hover:text-foreground">
              {nav('docs')}
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground-light hover:text-foreground"
            >
              {nav('signIn')}
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              {nav('getStarted')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground-dark sm:text-6xl">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-light">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
              >
                {t('hero.cta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://docs.mkpdfs.com"
                className="text-sm font-semibold leading-6 text-foreground"
              >
                {t('hero.viewDocs')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Code Example */}
          <div className="mx-auto mt-16 max-w-2xl rounded-xl bg-foreground-dark p-6 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <pre className="mt-4 overflow-x-auto text-sm text-gray-300">
              <code>{`curl -X POST https://api.mkpdfs.com/pdf/generate \\
  -H "X-Api-Key: tlfy_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "invoice-template",
    "data": {
      "customerName": "Acme Corp",
      "items": [{"name": "Widget", "price": 29.99}],
      "total": 29.99
    }
  }'`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground-dark sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-foreground-light">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground-dark">{feature.name}</h3>
                <p className="mt-2 text-sm text-foreground-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24 bg-muted">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground-dark sm:text-4xl">
              {t('pricing.title')}
            </h2>
            <p className="mt-4 text-lg text-foreground-light">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                  plan.popular ? 'ring-2 ring-primary' : 'border border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
                      {t('pricing.mostPopular')}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground-dark">{plan.name}</h3>
                <p className="mt-1 text-sm text-foreground-light">{plan.description}</p>
                <p className="mt-4 text-4xl font-bold text-foreground-dark">
                  {plan.price}
                  {plan.price !== 'Custom' && plan.price !== 'Personalizado' && (
                    <span className="text-base font-normal text-foreground-light">{common('perMonth')}</span>
                  )}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground-light">
                      <Check className="h-4 w-4 flex-shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {plan.price === 'Custom' || plan.price === 'Personalizado' ? t('pricing.contactSales') : nav('getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-20 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {t('cta.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-100"
              >
                {t('cta.button')}
              </Link>
              <a
                href="https://docs.mkpdfs.com"
                className="text-sm font-semibold text-white"
              >
                {t('cta.learnMore')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground-dark">{common('brandName')}</span>
            </div>
            <p className="text-sm text-foreground-light">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-foreground-light hover:text-foreground">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-sm text-foreground-light hover:text-foreground">
                {t('footer.terms')}
              </a>
              <a href="https://github.com/mkpdfs" className="text-foreground-light hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
