'use client'

import { useEffect } from 'react'
import { initRum } from '@/lib/rum'

/**
 * Mounted in the root layout (covers locale pages AND /callback, which lives
 * outside the [locale] Providers tree). Renders nothing.
 */
export function RumInit() {
  useEffect(() => {
    initRum()
  }, [])
  return null
}
