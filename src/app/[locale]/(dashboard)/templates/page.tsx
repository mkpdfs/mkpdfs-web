'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTemplates, useDeleteTemplate, useUploadTemplate, useProfile } from '@/hooks/useApi'
import { Spinner, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { FileText, Trash2, Search, Upload, X, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { UserTemplatePreviewModal } from '@/components/templates/UserTemplatePreviewModal'
import type { Template } from '@/types'

const ghostButtonClasses =
  'inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-ink/[0.12] bg-ink/[0.04] px-[18px] text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.08] disabled:cursor-not-allowed disabled:opacity-50'

const gradientButtonClasses =
  'inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-[18px] text-sm font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(124,92,255,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_20px_rgba(124,92,255,0.35)]'

const inputClasses =
  'h-10 w-full rounded-[10px] border border-ink/10 bg-ink/[0.03] px-3.5 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-[rgba(124,92,255,0.5)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,92,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50'

function UploadDropZone({
  onFileSelect,
  disabled,
  selectFileLabel,
  dragDropLabel,
  fileTypesLabel,
}: {
  onFileSelect: (file: File) => void
  disabled?: boolean
  selectFileLabel: string
  dragDropLabel: string
  fileTypesLabel: string
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file) onFileSelect(file)
    },
    [disabled, onFileSelect]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect]
  )

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${
        isDragging
          ? 'border-[rgba(124,92,255,0.6)] bg-[rgba(124,92,255,0.08)]'
          : 'border-ink/[0.15] hover:border-[rgba(124,92,255,0.45)] hover:bg-ink/[0.02]'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(124,92,255,0.25)] bg-[rgba(124,92,255,0.1)] text-brand-text">
        <Upload className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <p className="mb-1 text-sm font-medium text-fg">
        {selectFileLabel} <span className="font-normal text-fg-muted">{dragDropLabel}</span>
      </p>
      <p className="font-geist-mono text-xs text-fg-faint">{fileTypesLabel}</p>
      <input
        type="file"
        accept=".hbs,.handlebars,.html"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </label>
  )
}

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates()
  const { data: profile } = useProfile()
  const deleteTemplate = useDeleteTemplate()
  const uploadTemplate = useUploadTemplate()
  const t = useTranslations('templates')
  const common = useTranslations('common')
  const errors = useTranslations('errors')

  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const nameWithoutExt = file.name.replace(/\.(hbs|handlebars|html)$/i, '')
    setTemplateName(nameWithoutExt)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setTemplateName('')
    setDescription('')
  }

  const handleCloseModal = () => {
    setIsUploadModalOpen(false)
    handleClearFile()
  }

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) return

    try {
      await uploadTemplate.mutateAsync({
        file: selectedFile,
        name: templateName.trim(),
        description: description.trim() || undefined,
      })
      toast({
        title: t('uploadDialog.success'),
        description: `"${templateName}"`,
      })
      handleCloseModal()
    } catch (err) {
      toast({
        title: t('uploadDialog.error'),
        description: err instanceof Error ? err.message : errors('generic'),
        variant: 'destructive',
      })
    }
  }

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (template: Template, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTemplateToDelete(template)
  }

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return

    try {
      await deleteTemplate.mutateAsync(templateToDelete.id)
      toast({
        title: t('card.delete'),
        description: `"${templateToDelete.name}"`,
      })
      if (previewTemplate?.id === templateToDelete.id) {
        setPreviewTemplate(null)
      }
    } catch (err) {
      toast({
        title: common('error'),
        description: errors('generic'),
        variant: 'destructive',
      })
    } finally {
      setTemplateToDelete(null)
    }
  }

  const handleDeleteFromModal = (template: Template) => {
    setTemplateToDelete(template)
  }

  const templateCount = templates?.length ?? 0
  const templateLimit = profile?.subscriptionLimits?.templatesAllowed

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em]">{t('title')}</h1>
          <p className="text-[14.5px] text-fg-muted">
            {t('headerSubtitle')}{' '}
            {templateLimit != null && (
              <span className="font-geist-mono text-fg-dim">
                {templateCount} / {templateLimit === -1 ? '∞' : templateLimit}
              </span>
            )}
          </p>
        </div>
        <button onClick={() => setIsUploadModalOpen(true)} className={gradientButtonClasses}>
          <Upload className="h-[15px] w-[15px]" strokeWidth={2} />
          {t('uploadTemplate')}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
        <input
          placeholder={common('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputClasses} pl-10`}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" className="text-[#8C6CFF]" />
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-ink/[0.09] bg-surface-raised py-12 text-center">
          <p className="text-[14.5px] text-fg-muted">{errors('generic')}</p>
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/[0.15] px-8 py-16 text-center">
          <div className="mb-[18px] flex h-14 w-14 items-center justify-center rounded-[15px] border border-[rgba(124,92,255,0.25)] bg-[rgba(124,92,255,0.1)] text-brand-text">
            <FileText className="h-[26px] w-[26px]" strokeWidth={1.7} />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            {searchQuery ? t('empty.noResults') : t('empty.title')}
          </h2>
          <p className="mb-6 max-w-[380px] text-[14.5px] text-fg-muted">
            {searchQuery ? t('empty.tryAgain') : t('empty.dragDescription')}
          </p>
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setIsUploadModalOpen(true)} className={gradientButtonClasses}>
                <Upload className="h-[15px] w-[15px]" strokeWidth={2} />
                {t('uploadTemplate')}
              </button>
              <Link href="/marketplace" className={ghostButtonClasses}>
                {t('empty.browseMarketplace')}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates?.map((template) => (
            <div
              key={template.id}
              className="group cursor-pointer overflow-hidden rounded-[14px] border border-ink/[0.09] bg-surface-raised transition-colors hover:border-[rgba(124,92,255,0.45)]"
              onClick={() => setPreviewTemplate(template)}
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video w-full overflow-hidden border-b border-ink/[0.06] bg-ink/[0.02]">
                {template.thumbnailUrl ? (
                  <Image
                    src={template.thumbnailUrl}
                    alt={template.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(140deg,rgba(124,92,255,0.12),rgba(124,92,255,0.02))]">
                    <FileText className="h-12 w-12 text-brand-text/40" strokeWidth={1.5} />
                  </div>
                )}
                {/* Hover overlay with preview button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <div className="rounded-full border border-ink/10 bg-surface-card/90 p-2 shadow-lg">
                    <Eye className="h-5 w-5 text-fg" strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-fg">
                      {template.name}
                    </h3>
                    <p className="mt-0.5 font-geist-mono text-[12.5px] text-fg-dim">
                      {formatDate(template.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(template, e)}
                    disabled={deleteTemplate.isPending}
                    aria-label={t('card.delete')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-danger-soft/[0.1] hover:text-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {template.description && (
                  <p className="mt-2 text-[13px] text-fg-muted line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-ink/10 bg-surface-card p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-[-0.015em] text-fg">
                  {t('uploadDialog.title')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg"
                >
                  <X className="h-[15px] w-[15px]" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {!selectedFile ? (
                  <UploadDropZone
                    onFileSelect={handleFileSelect}
                    disabled={uploadTemplate.isPending}
                    selectFileLabel={t('uploadDialog.selectFile')}
                    dragDropLabel={t('uploadDialog.dragDrop')}
                    fileTypesLabel={t('uploadDialog.fileTypes')}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-[10px] border border-ink/10 bg-ink/[0.04] p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-brand-text" strokeWidth={1.8} />
                        <span className="truncate text-sm font-medium text-fg">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        onClick={handleClearFile}
                        disabled={uploadTemplate.isPending}
                        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-ink/[0.06] hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="templateName"
                        className="block font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted"
                      >
                        {t('uploadDialog.name')} *
                      </label>
                      <input
                        id="templateName"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder={t('uploadDialog.namePlaceholder')}
                        disabled={uploadTemplate.isPending}
                        className={inputClasses}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block font-geist-mono text-[11.5px] uppercase tracking-[0.09em] text-fg-muted"
                      >
                        {t('uploadDialog.description')}
                      </label>
                      <input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('uploadDialog.descriptionPlaceholder')}
                        disabled={uploadTemplate.isPending}
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={uploadTemplate.isPending}
                  className={ghostButtonClasses}
                >
                  {common('cancel')}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !templateName.trim() || uploadTemplate.isPending}
                  className={gradientButtonClasses}
                >
                  {uploadTemplate.isPending ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      {common('loading')}
                    </>
                  ) : (
                    <>
                      <Upload className="h-[15px] w-[15px]" strokeWidth={2} />
                      {t('uploadDialog.submit')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <UserTemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onDelete={handleDeleteFromModal}
        isDeleteLoading={deleteTemplate.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <DialogContent className="border-ink/10 bg-surface-card text-fg sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger-soft">
              <Trash2 className="h-5 w-5" />
              {t('card.delete')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-fg-muted">
              {t('card.deleteConfirm')}
              {templateToDelete && (
                <span className="mt-2 block font-medium text-fg">
                  &quot;{templateToDelete.name}&quot;
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3 sm:space-x-0">
            <button
              onClick={() => setTemplateToDelete(null)}
              disabled={deleteTemplate.isPending}
              className={ghostButtonClasses}
            >
              {common('cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteTemplate.isPending}
              className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-danger-soft/[0.35] bg-danger-soft/[0.1] px-[18px] text-sm font-semibold text-danger-soft transition-colors hover:bg-danger-soft/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteTemplate.isPending ? (
                <>
                  <Spinner size="sm" className="text-danger-soft" />
                  {common('loading')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {common('delete')}
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
