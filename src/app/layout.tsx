import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'mkpdfs - PDF Generation at Scale',
    template: '%s | mkpdfs',
  },
  description:
    'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
  keywords: ['PDF', 'API', 'Handlebars', 'templates', 'generation', 'automation', 'PDF API', 'document automation'],
  authors: [{ name: 'mkpdfs' }],
  creator: 'mkpdfs',
  publisher: 'mkpdfs',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    url: BASE_URL,
    siteName: 'mkpdfs',
    title: 'mkpdfs - PDF Generation at Scale',
    description:
      'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'mkpdfs - PDF Generation at Scale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mkpdfs - PDF Generation at Scale',
    description:
      'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'es': `${BASE_URL}/es`,
      'x-default': `${BASE_URL}/en`,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
}

type Props = {
  children: React.ReactNode
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'mkpdfs',
  description: 'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://mkpdfs.com',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '199',
    offerCount: '4',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '9',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Professional',
        price: '49',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Enterprise',
        price: '199',
        priceCurrency: 'USD',
      },
    ],
  },
  featureList: [
    'Handlebars PDF templates',
    'RESTful API',
    'Real-time PDF generation',
    'Template marketplace',
    'AI-powered template generation',
  ],
  screenshot: 'https://mkpdfs.com/og-image.png',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'mkpdfs',
  url: 'https://mkpdfs.com',
  logo: 'https://mkpdfs.com/logo.png',
  sameAs: [],
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.add(isDark ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
