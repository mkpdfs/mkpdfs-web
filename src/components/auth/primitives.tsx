'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2, FileText, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Auth-scoped presentational primitives, styled with the landing design system
 * (surface/fg/brand/ink tokens, brand gradient). Kept separate from the shared
 * `ui/{Button,Card,Input}` (old token system, used across the dashboard) so this
 * re-skin stays isolated to the auth surface.
 */

/* -------------------------------------------------------------------------- */
/* Brand mark — the landing nav's purple gradient logo tile                   */
/* -------------------------------------------------------------------------- */

export function AuthBrandMark({
  icon: Icon = FileText,
  className,
}: {
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] shadow-[0_0_0_1px_rgb(var(--ink)/0.12),0_8px_24px_rgba(124,92,255,0.4)]',
        className
      )}
    >
      <Icon className="h-6 w-6 text-white" strokeWidth={2.1} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

export function AuthCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-ink/[0.08] bg-surface-raised p-7 shadow-[0_1px_0_rgb(var(--ink)/0.04),0_24px_60px_-20px_rgba(124,92,255,0.22)]',
        className
      )}
      {...props}
    />
  )
}

export function AuthCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-6 flex flex-col items-center text-center', className)}
      {...props}
    />
  )
}

export function AuthCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'mt-4 text-[22px] font-semibold tracking-[-0.02em] text-fg',
        className
      )}
      {...props}
    />
  )
}

export function AuthCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1.5 text-[14.5px] text-fg-muted', className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

const authButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // primary brand gradient (mirrors the landing hero CTA)
        primary:
          'bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] text-white shadow-[0_8px_24px_rgba(124,92,255,0.35),inset_0_1px_0_rgb(var(--ink)/0.2)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(124,92,255,0.5)] active:translate-y-0 active:scale-[0.98]',
        outline:
          'border border-ink/10 bg-ink/[0.04] text-fg hover:bg-ink/[0.08]',
        danger:
          'bg-danger text-white shadow-[0_8px_24px_rgba(201,47,77,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

export interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof authButtonVariants> {
  isLoading?: boolean
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(authButtonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
)
AuthButton.displayName = 'AuthButton'

/* -------------------------------------------------------------------------- */
/* Field: label + input                                                        */
/* -------------------------------------------------------------------------- */

export function AuthLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-[13.5px] font-medium text-fg-muted', className)}
      {...props}
    />
  )
}

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-[10px] border border-ink/10 bg-surface px-3.5 text-[15px] text-fg outline-none transition placeholder:text-fg-faint focus:border-brand/60 focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus:border-danger focus:ring-danger/25',
        className
      )}
      {...props}
    />
  )
)
AuthInput.displayName = 'AuthInput'

/* -------------------------------------------------------------------------- */
/* Divider ("or continue with") + alerts + loader                              */
/* -------------------------------------------------------------------------- */

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-ink/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-surface-raised px-2 text-fg-faint">{label}</span>
      </div>
    </div>
  )
}

export function AuthAlert({
  tone = 'danger',
  className,
  children,
}: {
  tone?: 'danger' | 'ok'
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] p-3 text-sm',
        tone === 'danger'
          ? 'bg-danger/10 text-danger'
          : 'bg-ok/10 text-ok',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Google "G" glyph for the OAuth button. */
export function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/** Branded "checking session" loader. Sits inside AuthShell, which centers it. */
export function AuthLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-brand-text" />
      {message && <p className="text-sm text-fg-muted">{message}</p>}
    </div>
  )
}
