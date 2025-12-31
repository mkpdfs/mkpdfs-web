'use client'

import { useCallback, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

export interface ImageData {
  base64: string
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp'
  previewUrl: string
}

interface ImageUploadZoneProps {
  onImageSelect: (data: ImageData | null) => void
  imageData: ImageData | null
  disabled?: boolean
  className?: string
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function ImageUploadZone({
  onImageSelect,
  imageData,
  disabled = false,
  className,
}: ImageUploadZoneProps) {
  const t = useTranslations('ai')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('imageUpload.invalidType'))
      return
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setError(t('imageUpload.tooLarge'))
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/xxx;base64, prefix for API
      const base64 = result.split(',')[1]
      onImageSelect({
        base64,
        mediaType: file.type as ImageData['mediaType'],
        previewUrl: result, // Keep full data URL for preview
      })
    }
    reader.onerror = () => {
      setError(t('imageUpload.readError'))
    }
    reader.readAsDataURL(file)
  }, [onImageSelect, t])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

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
      if (file) processFile(file)
    },
    [disabled, processFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [processFile]
  )

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onImageSelect(null)
    setError(null)
  }, [onImageSelect])

  // If we have an image, show the preview
  if (imageData) {
    return (
      <div className={cn('relative rounded-lg border border-border p-2', className)}>
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          <img
            src={imageData.previewUrl}
            alt="Reference preview"
            className="h-full w-full object-contain"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-foreground-light">
          {t('imageUpload.referenceImage')}
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImageIcon className="mb-2 h-8 w-8 text-foreground-light" />
        <p className="mb-1 text-sm font-medium text-foreground-dark">
          {t('imageUpload.dropzone')}
        </p>
        <p className="text-xs text-foreground-light">
          {t('imageUpload.formats')}
        </p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </label>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
