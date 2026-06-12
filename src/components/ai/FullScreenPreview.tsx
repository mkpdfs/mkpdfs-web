'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Handlebars from 'handlebars'
import { FileText, Code2, RefreshCw, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type PreviewMode = 'html' | 'pdf'

interface FullScreenPreviewProps {
  templateContent: string
  sampleData: Record<string, unknown>
  pdfUrl?: string | null
  isPdfLoading?: boolean
  onRequestPdf?: () => void
  className?: string
}

// Register Handlebars helpers (same as backend)
const registerHelpers = () => {
  if (!Handlebars.helpers['ifEq']) {
    Handlebars.registerHelper('ifEq', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
      return a === b ? options.fn(this) : options.inverse(this)
    })
  }
  if (!Handlebars.helpers['gt']) {
    Handlebars.registerHelper('gt', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
      return Number(a) > Number(b) ? options.fn(this) : options.inverse(this)
    })
  }
  if (!Handlebars.helpers['formatDate']) {
    Handlebars.registerHelper('formatDate', (date: unknown) => {
      try {
        return new Date(date as string | number | Date).toLocaleDateString()
      } catch {
        return String(date)
      }
    })
  }
  if (!Handlebars.helpers['formatCurrency']) {
    Handlebars.registerHelper('formatCurrency', (amount: unknown) => {
      try {
        return `$${Number(amount).toFixed(2)}`
      } catch {
        return String(amount)
      }
    })
  }
}

export function FullScreenPreview({
  templateContent,
  sampleData,
  pdfUrl,
  isPdfLoading = false,
  onRequestPdf,
  className,
}: FullScreenPreviewProps) {
  const t = useTranslations('ai')
  const [mode, setMode] = useState<PreviewMode>('html')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Debounce HTML rendering
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Register helpers once
  useEffect(() => {
    registerHelpers()
  }, [])

  // Render HTML preview with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (!templateContent) {
        setHtmlContent('')
        setError(null)
        return
      }

      try {
        const compiled = Handlebars.compile(templateContent)
        const rendered = compiled(sampleData || {})
        setHtmlContent(rendered)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render template')
        setHtmlContent('')
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [templateContent, sampleData])

  // Write HTML content to iframe
  useEffect(() => {
    if (mode !== 'html' || !iframeRef.current || !htmlContent) return

    const doc = iframeRef.current.contentDocument
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
    }
  }, [htmlContent, mode])

  const handleModeChange = useCallback((newMode: PreviewMode) => {
    setMode(newMode)
    if (newMode === 'pdf' && onRequestPdf && !pdfUrl) {
      onRequestPdf()
    }
  }, [onRequestPdf, pdfUrl])

  const handleRefreshPdf = useCallback(() => {
    if (onRequestPdf) {
      onRequestPdf()
    }
  }, [onRequestPdf])

  const hasContent = templateContent.trim().length > 0

  return (
    <div className={cn('flex flex-col h-full rounded-[14px] border border-white/[0.09] overflow-hidden bg-[linear-gradient(180deg,#101014,#0C0C0F)]', className)}>
      {/* Mode Toggle - Top Left */}
      <div className="absolute left-4 top-8 z-10 flex items-center gap-1 rounded-[11px] border border-white/[0.09] bg-[#0C0C0F]/95 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur">
        <button
          onClick={() => handleModeChange('html')}
          className={cn(
            'flex items-center gap-2 rounded-[8px] px-3 py-1.5 font-geist-mono text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors',
            mode === 'html'
              ? 'bg-[#8C6CFF] text-white'
              : 'text-[#7E7E89] hover:bg-white/[0.06] hover:text-[#F4F4F6]'
          )}
        >
          <Code2 className="h-4 w-4" />
          {t('preview.htmlMode')}
        </button>
        <button
          onClick={() => handleModeChange('pdf')}
          className={cn(
            'flex items-center gap-2 rounded-[8px] px-3 py-1.5 font-geist-mono text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors',
            mode === 'pdf'
              ? 'bg-[#8C6CFF] text-white'
              : 'text-[#7E7E89] hover:bg-white/[0.06] hover:text-[#F4F4F6]'
          )}
        >
          <FileText className="h-4 w-4" />
          {t('preview.pdfMode')}
        </button>

        {mode === 'pdf' && onRequestPdf && hasContent && (
          <button
            onClick={handleRefreshPdf}
            disabled={isPdfLoading}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-[8px] text-[#7E7E89] transition-colors hover:bg-white/[0.06] hover:text-[#F4F4F6] disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isPdfLoading && 'animate-spin')} />
          </button>
        )}
      </div>

      {/* Preview Content - Full Screen */}
      <div className="flex-1 min-h-0 relative">
        {!hasContent ? (
          // Empty State
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#101014,#0C0C0F)]">
            <div className="flex max-w-md flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.14] text-[#B7A6FF]">
                <Sparkles className="h-6 w-6" strokeWidth={1.7} />
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-[-0.015em] text-[#F4F4F6]">
                {t('fullscreen.emptyTitle')}
              </h3>
              <p className="text-sm text-[#9C9CA8]">
                {t('fullscreen.emptyDescription')}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#101014,#0C0C0F)] p-4">
            <AlertCircle className="mb-2 h-12 w-12 text-[#FF8B8B]" strokeWidth={1.5} />
            <p className="text-lg font-medium text-[#FF8B8B]">{t('preview.renderError')}</p>
            <p className="mt-2 max-w-md text-center font-geist-mono text-[13px] text-[#9C9CA8]">{error}</p>
          </div>
        ) : mode === 'html' ? (
          <iframe
            ref={iframeRef}
            title="Template Preview"
            className="absolute inset-0 h-full w-full border-0 bg-white"
            sandbox="allow-same-origin"
          />
        ) : isPdfLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#101014,#0C0C0F)]">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#B7A6FF]" strokeWidth={1.7} />
              <p className="font-geist-mono text-[13px] text-[#9C9CA8]">{t('preview.generatingPdf')}</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#101014,#0C0C0F)]">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-[#5C5C66]" strokeWidth={1.5} />
              <p className="mb-4 font-geist-mono text-[13px] text-[#9C9CA8]">{t('preview.clickToGenerate')}</p>
              {onRequestPdf && (
                <button
                  onClick={handleRefreshPdf}
                  className="h-9 rounded-[9px] border border-white/[0.12] bg-white/[0.04] px-[18px] text-sm font-semibold text-[#F4F4F6] transition-colors hover:bg-white/[0.08]"
                >
                  {t('preview.generatePdf')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
