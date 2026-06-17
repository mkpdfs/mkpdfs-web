'use client'

import { useEffect, useRef, useState } from 'react'
import { composeThemedHtml } from '@/lib/theme/themePreview'
import type { ThemeInput } from '@/types'

// A4 at 96dpi — the marketplace templates are 210mm × 297mm pages.
const PAGE_W = 794
const PAGE_H = 1123

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
  const wrapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [html, setHtml] = useState('')
  const [scale, setScale] = useState(1)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scale the A4 page to fit the available width (never upscale past 1:1).
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const avail = el.clientWidth - 32 // breathing room
      if (avail > 0) setScale(Math.min(1, avail / PAGE_W))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
    <div ref={wrapRef} className={className} style={{ overflow: 'auto' }}>
      {/* Sized box reserves the scaled footprint and centers the page */}
      <div
        style={{
          width: PAGE_W * scale,
          height: PAGE_H * scale,
          margin: '16px auto',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        }}
      >
        <iframe
          ref={iframeRef}
          title="Theme preview"
          sandbox="allow-same-origin"
          style={{
            width: PAGE_W,
            height: PAGE_H,
            border: 0,
            background: '#fff',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  )
}
