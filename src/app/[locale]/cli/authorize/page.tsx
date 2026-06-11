import type { Metadata } from 'next'
import AuthorizeClient from './AuthorizeClient'

export const metadata: Metadata = {
  title: 'Authorize CLI — mkpdfs',
}

export default function CliAuthorizePage() {
  return <AuthorizeClient />
}
