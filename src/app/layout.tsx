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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F5F8' },
  ],
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
    '@type': 'Offer',
    name: 'Pay-as-you-go credits',
    description: '$10 of credits ≈ 1,000 PDF pages ($0.01/page). 10 free pages to start, no card required.',
    price: '10',
    priceCurrency: 'USD',
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
                  var s = localStorage.getItem('mkpdfs-theme');
                  var resolved;
                  if (s === 'light' || s === 'dark') {
                    resolved = s;
                  } else if (window.matchMedia) {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else {
                    resolved = 'dark';
                  }
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolved);
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
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
