// Shared SEO constants + helpers.
//
// Next.js merges metadata SHALLOWLY per top-level key: any page that defines its
// own `openGraph`/`twitter` REPLACES the parent's object wholesale (it does not
// deep-merge). So every page that customizes og/twitter must re-include the
// image + card here, or the social image silently disappears.

import type { Metadata } from 'next'
import { locales, defaultLocale } from '@/i18n/config'

export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'mkpdfs - PDF Generation API for Developers',
} as const

export const TWITTER_CARD = 'summary_large_image' as const

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'

// as-needed routing: the default locale lives at the root with no prefix.
export const localizedUrl = (locale: string, path = '') =>
  locale === defaultLocale ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`

const OG_LOCALES: Record<string, string> = { en: 'en_US', es: 'es_ES' }
export const ogLocaleFor = (locale: string) => OG_LOCALES[locale] ?? 'en_US'

// hreflang map (every locale + x-default) for a given path.
export const languageAlternates = (path = '') => ({
  ...Object.fromEntries(locales.map((l) => [l, localizedUrl(l, path)])),
  'x-default': localizedUrl(defaultLocale, path),
})

/**
 * Builds a complete, locale-correct Metadata object for a page: self-referencing
 * canonical + hreflang, and og/twitter (with the social image, re-included to
 * survive the shallow merge). Title goes through the "%s | mkpdfs" template.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string
  path?: string
  title: string
  description: string
}): Metadata {
  const canonical = localizedUrl(locale, path)
  return {
    title,
    description,
    alternates: { canonical, languages: languageAlternates(path) },
    openGraph: {
      type: 'website',
      siteName: 'mkpdfs',
      title,
      description,
      url: canonical,
      locale: ogLocaleFor(locale),
      images: [OG_IMAGE],
    },
    twitter: { card: TWITTER_CARD, title, description, images: [OG_IMAGE.url] },
  }
}
