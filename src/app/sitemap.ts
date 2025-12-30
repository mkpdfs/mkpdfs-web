import { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Public pages that should be indexed
  const publicPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  // Dashboard pages (lower priority as they require auth, but still indexable for SEO)
  const dashboardPages = [
    { path: '/dashboard', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/templates', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/marketplace', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/integration', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/api-keys', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/billing', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/ai-generate', priority: 0.8, changeFrequency: 'weekly' as const },
  ]

  const allPages = [...publicPages, ...dashboardPages]
  const entries: MetadataRoute.Sitemap = []

  // Generate entries for each locale
  locales.forEach((locale) => {
    allPages.forEach((page) => {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
          ),
        },
      })
    })
  })

  return entries
}
