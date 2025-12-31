'use client'

import { Link } from '@/i18n/routing'
import { ArrowRight } from 'lucide-react'
import { AnimatedGradientText } from './AnimatedGradientText'
import { TypewriterCode } from './TypewriterCode'

interface HeroSectionProps {
  title: string
  titleHighlight: string
  subtitle: string
  ctaText: string
  curlCode: string
}

export function HeroSection({
  title,
  titleHighlight,
  subtitle,
  ctaText,
  curlCode,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950/30 dark:via-background dark:to-secondary-950/30" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground-dark sm:text-6xl opacity-0 animate-hero-entrance">
            {title}{' '}
            <AnimatedGradientText>{titleHighlight}</AnimatedGradientText>
          </h1>
          <p
            className="mt-6 text-lg leading-8 text-foreground-light opacity-0 animate-hero-entrance"
            style={{ animationDelay: '0.2s' }}
          >
            {subtitle}
          </p>
          <div
            className="mt-10 flex items-center justify-center opacity-0 animate-hero-entrance"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          className="mx-auto mt-16 max-w-2xl rounded-xl bg-foreground-dark p-6 shadow-2xl opacity-0 animate-hero-entrance"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <TypewriterCode code={curlCode} typingSpeed={20} startDelay={1200} />
        </div>
      </div>
    </section>
  )
}
