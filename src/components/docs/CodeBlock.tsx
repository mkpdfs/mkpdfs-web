'use client'
import { useRef, useState } from 'react'

export function CodeBlock({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: unknown
}) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  function copy() {
    if (!preRef.current) return
    navigator.clipboard.writeText(preRef.current.innerText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative group">
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
      <button
        onClick={copy}
        aria-label="Copy code"
        className="absolute top-3 right-3 rounded px-2 py-1 text-xs font-medium bg-surface-overlay text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-fg hover:bg-surface-card border border-border"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
