/**
 * Scroll-pinned section (desktop only): the content sticks to the top of the
 * viewport while the user scrolls through `extraVh` of invisible runway below
 * it, so each section "holds" before the next one slides in right behind it.
 * Pure CSS (sticky + runway) — natural content heights, no centering, no
 * clipping, no dead gaps between sections. Normal flow on <lg screens.
 */
export function PinnedSection({
  children,
  extraVh = 50,
}: {
  children: React.ReactNode
  extraVh?: number
}) {
  return (
    <div className="lg:relative">
      <div className="lg:sticky lg:top-0">{children}</div>
      {/* runway: scrolled through while the content above stays pinned */}
      <div aria-hidden style={{ height: `${extraVh}vh` }} className="hidden lg:block" />
    </div>
  )
}
