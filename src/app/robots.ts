import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'
const IS_PROD_SITE = BASE_URL === 'https://mkpdfs.com'

// Replaces the old static public/robots.txt, whose Sitemap: line was
// hardcoded to prod on every environment.
//
// Patterns are doubled because the default locale (en) is served unprefixed
// (e.g. /settings) while other locales are prefixed (e.g. /es/settings).
// Deliberately NOT Disallow: / on dev — dev deindexing is done by the global
// X-Robots-Tag header (next.config.mjs), which crawlers can only see if
// they're allowed to fetch the pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/callback',
        '/logout',
        '/dashboard',
        '/*/dashboard',
        '/settings',
        '/*/settings',
        '/billing',
        '/*/billing',
        '/api-keys',
        '/*/api-keys',
        '/usage',
        '/*/usage',
        '/create',
        '/*/create',
        '/templates',
        '/*/templates',
        '/ai-generate',
        '/*/ai-generate',
        '/marketplace',
        '/*/marketplace',
        '/integration',
        '/*/integration',
        '/explainer.html',
      ],
    },
    // Don't advertise a sitemap of noindexed pages on dev.
    ...(IS_PROD_SITE ? { sitemap: `${BASE_URL}/sitemap.xml` } : {}),
  }
}
