import type { Metadata } from 'next'
import ResetPasswordClient from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your mkpdfs password by entering the verification code sent to your email.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
