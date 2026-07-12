/**
 * Scroll-pinned section, stacking-cards pattern (desktop only): every section
 * is sticky at the top of the viewport with an opaque background, so the next
 * section slides in OVER the pinned one — the previous section visibly stops
 * while the visitor keeps scrolling, with zero empty runway in the document
 * (no dead gaps between sections). Sections shorter than the viewport are
 * vertically centered. Normal flow on <lg screens.
 */
export function PinnedSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:bg-surface">
      {children}
    </div>
  )
}
