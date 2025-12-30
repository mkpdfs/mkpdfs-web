import type { Metadata } from 'next'
import ForgotPasswordClient from './ForgotPasswordClient'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your mkpdfs password. Enter your email address and we will send you a link to reset your password.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
