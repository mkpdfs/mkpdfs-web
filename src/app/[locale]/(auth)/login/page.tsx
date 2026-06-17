import type { Metadata } from 'next'
import { OG_IMAGE, TWITTER_CARD } from '@/lib/seo'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your mkpdfs account to manage your PDF templates, generate documents, and access your API keys.',
  openGraph: {
    title: 'Sign In | mkpdfs',
    description: 'Sign in to your mkpdfs account to manage your PDF templates and generate documents.',
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: 'Sign In | mkpdfs',
    description: 'Sign in to your mkpdfs account to manage your PDF templates and generate documents.',
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginPage() {
  return <LoginClient />
}
