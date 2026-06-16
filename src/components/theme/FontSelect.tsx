'use client'

import { useEffect, useRef } from 'react'
import { FONTS } from '@/lib/theme/fonts'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (fontKey: string) => void
}

export function FontSelect({ value, onChange }: Props) {
  const selectRef = useRef<HTMLSelectElement>(null)

  // Inject a <link> for the currently selected font so the label renders in-font
  useEffect(() => {
    const font = FONTS[value]
    if (!font) return
    const id = `font-select-link-${value}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = font.linkHref
    document.head.appendChild(link)
  }, [value])

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">Font</label>
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          // Custom arrow via bg-image
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-8'
        )}
      >
        {Object.entries(FONTS).map(([key, def]) => (
          <option
            key={key}
            value={key}
            style={{ fontFamily: def.headingStack }}
          >
            {def.label}
          </option>
        ))}
      </select>
      {/* Show currently selected font name in its own stack */}
      {FONTS[value] && (
        <p
          className="text-xs text-muted-foreground"
          style={{ fontFamily: FONTS[value].headingStack }}
        >
          {FONTS[value].label}
        </p>
      )}
    </div>
  )
}
