import type { Metadata } from 'next'
import CallbackClient from './CallbackClient'

export const metadata: Metadata = {
  title: 'Signing In...',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CallbackPage() {
  return <CallbackClient />
}
