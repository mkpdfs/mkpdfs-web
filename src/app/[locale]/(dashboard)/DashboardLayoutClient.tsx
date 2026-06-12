'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { useAuth } from '@/providers'
import { Sidebar, Header } from '@/components/layout'
import { PageLoader } from '@/components/ui'

export default function DashboardLayoutClient({
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
    <div
      className={`${GeistSans.variable} ${GeistMono.variable} dark flex h-screen overflow-hidden bg-[#08080A] font-geist text-[#F4F4F6]`}
    >
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <div className="relative flex-1 overflow-y-auto">
          {/* ambient violet glow at the top of the content column */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-160px] h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.13),transparent_65%)]"
          />
          <main className="relative mx-auto w-full max-w-[1060px] px-4 pb-12 pt-9 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
