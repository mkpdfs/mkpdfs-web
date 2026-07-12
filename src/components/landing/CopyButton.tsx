'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Small clipboard button for landing code snippets (always visible — the
 *  hover-reveal pattern used in docs is unusable on touch). */
export function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-ink/[0.1] bg-surface px-2.5 py-1.5 font-geist-mono text-[11.5px] text-fg-muted transition hover:text-fg hover:border-ink/[0.2] active:scale-[0.97]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </button>
  )
}
