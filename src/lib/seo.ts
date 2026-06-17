// Shared SEO constants.
//
// Next.js merges metadata SHALLOWLY per top-level key: any page that defines its
// own `openGraph`/`twitter` REPLACES the parent's object wholesale (it does not
// deep-merge). So every page that customizes og/twitter must re-include the
// image + card here, or the social image silently disappears.

export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'mkpdfs - PDF Generation API for Developers',
} as const

export const TWITTER_CARD = 'summary_large_image' as const
