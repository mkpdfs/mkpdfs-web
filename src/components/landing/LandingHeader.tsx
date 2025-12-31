'use client'

import { Link } from '@/i18n/routing'
import { FileText } from 'lucide-react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface LandingHeaderProps {
  brandName: string
  featuresLabel: string
  pricingLabel: string
  signInLabel: string
  getStartedLabel: string
}

export function LandingHeader({
  brandName,
  featuresLabel,
  pricingLabel,
  signInLabel,
  getStartedLabel,
}: LandingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground-dark">{brandName}</span>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          <a href="#features" className="text-sm font-medium text-foreground-light hover:text-foreground">
            {featuresLabel}
          </a>
          <a href="#pricing" className="text-sm font-medium text-foreground-light hover:text-foreground">
            {pricingLabel}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <ThemeToggle />
          <LanguageSelector variant="compact" />
          <Link
            href="/login"
            className="text-sm font-medium text-foreground-light hover:text-foreground"
          >
            {signInLabel}
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            {getStartedLabel}
          </Link>
        </div>
      </nav>
    </header>
  )
}
