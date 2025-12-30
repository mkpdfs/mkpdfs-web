import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free mkpdfs account to start generating professional PDFs at scale. Get started with our free tier today.',
  openGraph: {
    title: 'Create Account | mkpdfs',
    description: 'Create your free mkpdfs account to start generating professional PDFs at scale.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
