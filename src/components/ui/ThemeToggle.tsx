'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-ink/10 bg-transparent text-fg-muted transition-colors hover:bg-ink/[0.05] hover:text-fg',
        className
      )}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.9} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      )}
    </button>
  )
}
