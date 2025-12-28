'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers'
import { Sidebar, Header } from '@/components/layout'
import { PageLoader } from '@/components/ui'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isInitializing, isLoading } = useAuth()

  useEffect(() => {
    if (!isInitializing && !isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isInitializing, isLoading, router])

  if (isInitializing || isLoading) {
    return <PageLoader message="Loading..." />
  }

  if (!isAuthenticated) {
    return <PageLoader message="Redirecting to login..." />
  }

  return (
    <div className="min-h-screen bg-muted">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
