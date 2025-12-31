'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Handlebars from 'handlebars'
import { FileText, Code2, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, Spinner } from '@/components/ui'
import { useTranslations } from 'next-intl'

type PreviewMode = 'html' | 'pdf'

interface LivePreviewProps {
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

export function LivePreview({
  templateContent,
  sampleData,
  pdfUrl,
  isPdfLoading = false,
  onRequestPdf,
  className,
}: LivePreviewProps) {
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
    <div className={cn('flex flex-col rounded-lg border border-border overflow-hidden', className)}>
      {/* Mode Toggle */}
      <div className="flex items-center justify-between bg-muted p-2">
        <div className="flex gap-1">
          <button
            onClick={() => handleModeChange('html')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === 'html'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Code2 className="h-4 w-4" />
            {t('preview.htmlMode')}
          </button>
          <button
            onClick={() => handleModeChange('pdf')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === 'pdf'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            {t('preview.pdfMode')}
          </button>
        </div>

        {mode === 'pdf' && onRequestPdf && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPdf}
            disabled={isPdfLoading || !hasContent}
          >
            <RefreshCw className={cn('h-4 w-4', isPdfLoading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 min-h-0 bg-white">
        {!hasContent ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('preview.noContent')}</p>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-destructive">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">{t('preview.renderError')}</p>
            <p className="mt-1 text-xs text-center max-w-md">{error}</p>
          </div>
        ) : mode === 'html' ? (
          <iframe
            ref={iframeRef}
            title="Template Preview"
            className="h-full w-full border-0"
            sandbox="allow-same-origin"
          />
        ) : isPdfLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" className="mb-2" />
              <p className="text-sm text-muted-foreground">{t('preview.generatingPdf')}</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('preview.clickToGenerate')}</p>
              {onRequestPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleRefreshPdf}
                >
                  {t('preview.generatePdf')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
