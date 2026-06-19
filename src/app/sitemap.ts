import { MetadataRoute } from 'next'
import { locales, defaultLocale } from '@/i18n/config'
import { allDocSlugs } from '@/lib/docs/nav'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'

// Fixed lastmod for the (rarely-changing) public pages. Using `new Date()` made
// every URL look freshly modified on each crawl, which crawlers learn to ignore.
// Bump this when the public marketing/auth pages get a meaningful content change.
const LAST_MODIFIED = new Date('2026-06-18')

// as-needed: default locale lives at the root with no prefix; others are prefixed
const localizedUrl = (locale: string, path: string) =>
  locale === defaultLocale
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`

export default function sitemap(): MetadataRoute.Sitemap {
  // Only publicly reachable, indexable pages belong here. Dashboard routes are
  // auth-gated (they redirect crawlers to /login) and carry robots noindex via
  // the (dashboard) layout, so listing them only wastes crawl budget and sends
  // contradictory signals.
  const allPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
    ...allDocSlugs.map((slug) => ({ path: `/docs/${slug}`, priority: 0.7, changeFrequency: 'weekly' as const })),
  ]
  const entries: MetadataRoute.Sitemap = []

  // Generate entries for each locale
  locales.forEach((locale) => {
    allPages.forEach((page) => {
      entries.push({
        url: localizedUrl(locale, page.path),
        lastModified: LAST_MODIFIED,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, localizedUrl(l, page.path)])
            ),
            'x-default': localizedUrl(defaultLocale, page.path),
          },
        },
      })
    })
  })

  return entries
}
