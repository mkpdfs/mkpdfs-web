'use client'

import { useRouter } from 'next/navigation'
import { AIGenerateSection } from '@/components/templates/AIGenerateSection'

export default function AIGeneratePage() {
  const router = useRouter()

  const handleSaveComplete = () => {
    router.push('/templates')
  }

  return <AIGenerateSection onSaveComplete={handleSaveComplete} />
}
