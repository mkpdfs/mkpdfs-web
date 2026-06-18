import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

/**
 * Recreates the landing page's visual context (src/app/[locale]/page.tsx) for
 * the auth surface: Geist font vars, the `mk-landing` selection color, the
 * brand surface/fg tokens, and the ambient violet glow + faint grid. Owns the
 * viewport, centering and padding so the auth clients only render their card.
 *
 * Server component — used from the `(auth)` layout and the (out-of-group)
 * `cli/authorize` page. Do NOT import it into client components.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistSans.variable} ${GeistMono.variable} mk-landing relative flex min-h-screen items-center justify-center overflow-x-hidden bg-surface px-4 py-10 font-geist text-fg`}
    >
      {/* ambient violet glow, masked from the top (mirrors the landing) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-220px] z-0 h-[600px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.18),transparent_62%)]"
      />
      {/* faint grid — token-aware (rgb(var(--ink))) so it reads in light AND dark,
          unlike the landing's hardcoded white grid tuned for its dark background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgb(var(--ink)/0.025)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/0.025)_1px,transparent_1px)] bg-[length:64px_64px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000,transparent_75%)]"
      />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
