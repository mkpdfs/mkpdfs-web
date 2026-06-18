import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import AuthorizeClient from './AuthorizeClient'

export const metadata: Metadata = {
  title: 'Authorize CLI — mkpdfs',
}

export default function CliAuthorizePage() {
  return (
    <AuthShell>
      <AuthorizeClient />
    </AuthShell>
  )
}
