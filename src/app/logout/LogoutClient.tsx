'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/ui'

export default function LogoutClient() {
  const router = useRouter()

  useEffect(() => {
    // OAuth sign-out redirect lands here
    // Simply redirect to login page
    router.replace('/en/login')
  }, [router])

  return <PageLoader message="Signing out..." />
}
