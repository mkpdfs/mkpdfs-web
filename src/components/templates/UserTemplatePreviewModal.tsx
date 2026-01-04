'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { X, FileText, Trash2, Code } from 'lucide-react'
import type { Template } from '@/types'
import { useTemplate } from '@/hooks/useApi'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'

interface UserTemplatePreviewModalProps {
  template: Template | null
  onClose: () => void
  onDelete: (template: Template) => void
  isDeleteLoading?: boolean
}

export function UserTemplatePreviewModal({
  template,
  onClose,
  onDelete,
  isDeleteLoading,
}: UserTemplatePreviewModalProps) {
  const t = useTranslations('templates')
  const common = useTranslations('common')

  const { data: templateWithContent, isLoading } = useTemplate(template?.id || '')

  if (!template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-foreground">{template.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(template.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="border-b bg-muted px-6 py-4">
          <div className="relative mx-auto h-64 w-full max-w-xl">
            {template.thumbnailUrl ? (
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-lg object-contain shadow-sm"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <FileText className="h-16 w-16 text-primary/40" />
              </div>
            )}
          </div>
        </div>

        {/* Template Code Section */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('preview.templateCode')}</span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted p-4">
              <pre className="max-h-64 overflow-auto text-sm">
                <code>{templateWithContent?.content || t('preview.loadingTemplate')}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <div className="border-t bg-muted px-6 py-4">
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <Button
            variant="destructive"
            onClick={() => onDelete(template)}
            disabled={isDeleteLoading}
          >
            {isDeleteLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Trash2 className="mr-1.5 h-4 w-4" />
            )}
            {t('card.delete')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {common('close')}
          </Button>
        </div>
      </div>
    </div>
  )
}
