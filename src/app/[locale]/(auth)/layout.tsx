import { AuthShell } from '@/components/auth/AuthShell'

/**
 * Wraps every page in the (auth) route group — login, register,
 * forgot-password, reset-password — in the branded AuthShell (landing context,
 * centering, ambient layers). The clients render only their card.
 *
 * Note: `cli/authorize` lives OUTSIDE this group, so it wraps AuthShell in its
 * own page.tsx.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthShell>{children}</AuthShell>
}
