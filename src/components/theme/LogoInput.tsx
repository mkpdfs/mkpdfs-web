'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, X, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { LogoDraft } from '@/lib/theme/draft'

export type { LogoDraft }

interface Props {
  value: LogoDraft
  onChange: (v: LogoDraft) => void
  mode: 'adopt' | 'edit'
}

const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'
const HTTPS_RE = /^https:\/\/.+/

export function LogoInput({ value, onChange, mode }: Props) {
  const t = useTranslations('branding')
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [urlValue, setUrlValue] = useState(value?.kind === 'url' ? value.url : '')
  const [urlError, setUrlError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const prevObjectUrl = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Revoke old object URL on replace or unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current)
      }
    }
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current)
      const previewUrl = URL.createObjectURL(file)
      prevObjectUrl.current = previewUrl
      onChange({ kind: 'upload', file, previewUrl })
    },
    [onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setUrlValue(url)
      if (HTTPS_RE.test(url)) {
        setUrlError(false)
        onChange({ kind: 'url', url })
      } else {
        setUrlError(true)
      }
    },
    [onChange]
  )

  const handleRemove = useCallback(() => {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current)
      prevObjectUrl.current = null
    }
    onChange(null)
    setUrlValue('')
    setUrlError(false)
  }, [onChange])

  const tabClass = (active: boolean) =>
    cn(
      'flex-1 py-2 text-sm font-medium transition-colors border-b-2',
      active
        ? 'border-[#8C6CFF] text-[#8C6CFF]'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t('logo')}
        </label>
        {value !== null && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
            {t('removeLogo')}
          </button>
        )}
      </div>

      {/* Existing logo indicator (edit mode) */}
      {value?.kind === 'existing' && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <span>{t('existingLogo')}</span>
        </div>
      )}

      {/* Upload preview */}
      {value?.kind === 'upload' && (
        <div className="relative flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.previewUrl}
            alt="Logo preview"
            className="h-10 w-10 rounded object-contain"
          />
          <span className="flex-1 truncate text-xs text-muted-foreground">
            {value.file.name}
          </span>
        </div>
      )}

      {/* URL preview */}
      {value?.kind === 'url' && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Link className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{value.url}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button type="button" className={tabClass(tab === 'upload')} onClick={() => setTab('upload')}>
          {t('uploadTab')}
        </button>
        <button type="button" className={tabClass(tab === 'url')} onClick={() => setTab('url')}>
          {t('urlTab')}
        </button>
      </div>

      {tab === 'upload' ? (
        <label
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragging
              ? 'border-[#8C6CFF] bg-[#8C6CFF]/5'
              : 'border-border hover:border-[#8C6CFF]/50 hover:bg-muted/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mb-2 h-7 w-7 text-muted-foreground" />
          <p className="mb-0.5 text-sm font-medium text-foreground">
            {t('dropOrClick')}
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WebP, SVG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={LOGO_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex flex-col gap-1.5">
          <input
            type="url"
            value={urlValue}
            onChange={handleUrlChange}
            placeholder="https://example.com/logo.png"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              urlError && urlValue.length > 0 && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          {urlError && urlValue.length > 0 && (
            <p className="text-xs text-destructive">{t('urlMustBeHttps')}</p>
          )}
        </div>
      )}
    </div>
  )
}
