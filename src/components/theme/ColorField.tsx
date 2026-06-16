'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

interface Props {
  label: string
  value: string
  onChange: (hex: string) => void
}

export function ColorField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep local text in sync when value changes externally
  useEffect(() => {
    setText(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePickerChange = useCallback(
    (hex: string) => {
      setText(hex)
      onChange(hex.toLowerCase())
    },
    [onChange]
  )

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setText(raw)
      const normalized = raw.startsWith('#') ? raw : `#${raw}`
      if (HEX_RE.test(normalized)) {
        onChange(normalized.toLowerCase())
      }
    },
    [onChange]
  )

  const isValid = HEX_RE.test(text)

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative flex items-center gap-2">
        {/* Swatch button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-9 flex-shrink-0 rounded-md border border-input shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ backgroundColor: isValid ? value : '#8C6CFF' }}
          aria-label={`Pick color for ${label}`}
        />

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          maxLength={7}
          spellCheck={false}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            !isValid && 'border-destructive focus-visible:ring-destructive'
          )}
          placeholder="#8C6CFF"
        />

        {/* Popover */}
        {open && (
          <div className="absolute left-0 top-11 z-50 rounded-lg border border-border bg-background p-3 shadow-lg">
            <HexColorPicker color={isValid ? value : '#8C6CFF'} onChange={handlePickerChange} />
          </div>
        )}
      </div>
      {!isValid && (
        <p className="text-xs text-destructive">Enter a valid hex color (e.g. #8C6CFF)</p>
      )}
    </div>
  )
}
