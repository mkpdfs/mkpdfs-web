'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, RotateCcw, Code, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

type ViewMode = 'code' | 'preview'

interface VersionData {
  template: string
  name: string
  description: string
}

interface VersionComparisonProps {
  previousVersion: VersionData
  currentVersion: VersionData
  onAcceptCurrent: () => void
  onRevertToPrevious: () => void
  className?: string
}

export function VersionComparison({
  previousVersion,
  currentVersion,
  onAcceptCurrent,
  onRevertToPrevious,
  className,
}: VersionComparisonProps) {
  const t = useTranslations('ai')
  const [viewMode, setViewMode] = useState<ViewMode>('code')
  const [expandedPanel, setExpandedPanel] = useState<'previous' | 'current' | null>(null)

  const toggleExpand = (panel: 'previous' | 'current') => {
    setExpandedPanel(expandedPanel === panel ? null : panel)
  }

  return (
    <div className={cn('flex flex-col rounded-lg border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-muted px-4 py-2">
        <h3 className="text-sm font-medium">{t('comparison.title')}</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md bg-background p-0.5">
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                viewMode === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Code className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Panels */}
      <div className="flex flex-1 min-h-0">
        {/* Previous Version */}
        <div
          className={cn(
            'flex flex-col border-r border-border transition-all',
            expandedPanel === 'previous' ? 'w-full' : expandedPanel === 'current' ? 'w-0 hidden' : 'w-1/2'
          )}
        >
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/30 px-3 py-1.5 border-b border-border">
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">{t('comparison.previous')}</span>
            </div>
            <button
              onClick={() => toggleExpand('previous')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {expandedPanel === 'previous' ? t('comparison.collapse') : t('comparison.expand')}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {viewMode === 'code' ? (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground-light">
                {previousVersion.template}
              </pre>
            ) : (
              <iframe
                srcDoc={previousVersion.template}
                title="Previous version preview"
                className="h-full w-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>

        {/* Current Version */}
        <div
          className={cn(
            'flex flex-col transition-all',
            expandedPanel === 'current' ? 'w-full' : expandedPanel === 'previous' ? 'w-0 hidden' : 'w-1/2'
          )}
        >
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 px-3 py-1.5 border-b border-border">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">{t('comparison.current')}</span>
            </div>
            <button
              onClick={() => toggleExpand('current')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {expandedPanel === 'current' ? t('comparison.collapse') : t('comparison.expand')}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {viewMode === 'code' ? (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                {currentVersion.template}
              </pre>
            ) : (
              <iframe
                srcDoc={currentVersion.template}
                title="Current version preview"
                className="h-full w-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRevertToPrevious}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('comparison.revert')}
        </Button>
        <Button
          size="sm"
          onClick={onAcceptCurrent}
        >
          <Check className="mr-2 h-4 w-4" />
          {t('comparison.accept')}
        </Button>
      </div>
    </div>
  )
}
