'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  // The resolved theme is only known on the client (localStorage / system). Render a
  // theme-neutral placeholder until mounted so the SSR and first client render match —
  // otherwise the Sun/Moon SVG <path> differs and hydration fails for the whole root.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const label = resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={mounted ? label : undefined}
      aria-label={mounted ? label : 'Toggle theme'}
      className={cn(
        'flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-ink/10 bg-transparent text-fg-muted transition-colors hover:bg-ink/[0.05] hover:text-fg',
        className
      )}
    >
      {!mounted ? (
        <span className="h-[18px] w-[18px]" />
      ) : resolvedTheme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.9} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      )}
    </button>
  )
}
