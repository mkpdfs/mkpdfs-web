import type { Metadata } from 'next'
import DashboardLayoutClient from './DashboardLayoutClient'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | mkpdfs',
  },
  description: 'Manage your PDF templates, API keys, and monitor your usage in the mkpdfs dashboard.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
