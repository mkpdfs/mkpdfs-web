import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'mkpdfs - PDF Generation at Scale',
    template: '%s | mkpdfs',
  },
  description:
    'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
  keywords: ['PDF', 'API', 'Handlebars', 'templates', 'generation', 'automation'],
  authors: [{ name: 'mkpdfs' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mkpdfs.com',
    siteName: 'mkpdfs',
    title: 'mkpdfs - PDF Generation at Scale',
    description:
      'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mkpdfs - PDF Generation at Scale',
    description:
      'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
  },
  robots: {
    index: true,
    follow: true,
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

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
