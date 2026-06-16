'use client'

import { useEffect, useRef, useState } from 'react'
import { composeThemedHtml } from '@/lib/theme/themePreview'
import type { ThemeInput } from '@/types'

interface Props {
  templateContent: string
  sampleData: Record<string, unknown>
  theme?: ThemeInput
  logoPreviewUrl?: string | null
  className?: string
}

export function ThemedPreview({
  templateContent,
  sampleData,
  theme,
  logoPreviewUrl,
  className,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [html, setHtml] = useState('')
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      try {
        setHtml(
          templateContent
            ? composeThemedHtml(templateContent, sampleData, theme, logoPreviewUrl)
            : ''
        )
      } catch {
        setHtml('<p style="font-family:sans-serif;padding:16px;color:#b00">Preview error</p>')
      }
    }, 300)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [templateContent, sampleData, theme, logoPreviewUrl])

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      title="Theme preview"
      className={className}
      sandbox="allow-same-origin"
    />
  )
}
