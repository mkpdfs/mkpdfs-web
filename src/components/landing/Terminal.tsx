'use client'

import { useEffect, useRef, useState } from 'react'

type Tab = 'curl' | 'node' | 'python'

// Code samples are part of the design — keep verbatim, never translate.
const CODES: Record<Tab, string> = {
  curl: `$ curl -X POST https://api.mkpdfs.com/v1/pdf \\
    -H "Authorization: Bearer sk_live_…" \\
    -H "Content-Type: application/json" \\
    -d '{
      "template": "invoice",
      "data": {
        "customer": "Acme Corp",
        "items": [{ "name": "Plan", "price": 1240 }],
        "total": 1240.00
      }
    }'`,
  node: `import { mkpdfs } from "mkpdfs";

const client = mkpdfs("sk_live_…");

const { url } = await client.generate({
  template: "invoice",
  data: {
    customer: "Acme Corp",
    items: [{ name: "Plan", price: 1240 }],
    total: 1240.00,
  },
});

console.log(url); // → cdn.mkpdfs.com/…`,
  python: `from mkpdfs import Client

client = Client("sk_live_…")

pdf = client.generate(
    template="invoice",
    data={
        "customer": "Acme Corp",
        "items": [{"name": "Plan", "price": 1240}],
        "total": 1240.00,
    },
)

print(pdf.url)  # → cdn.mkpdfs.com/…`,
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'node', label: 'Node' },
  { id: 'python', label: 'Python' },
]

const TAB_ORDER: Tab[] = ['curl', 'node', 'python']

export function Terminal() {
  const [tab, setTab] = useState<Tab>('curl')
  const [done, setDone] = useState(false)
  const codeRef = useRef<HTMLSpanElement>(null)
  const userTookOver = useRef(false)

  const selectTab = (next: Tab) => {
    userTookOver.current = true
    setTab(next)
  }

  // Typing progress writes into the span imperatively — no re-render per character.
  useEffect(() => {
    const el = codeRef.current
    if (!el) return
    const code = CODES[tab]
    setDone(false)
    el.textContent = ''

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = code
      setDone(true)
      return
    }

    let i = 0
    const timer = setInterval(() => {
      i += 4
      el.textContent = code.slice(0, i)
      if (i >= code.length) {
        el.textContent = code
        clearInterval(timer)
        setDone(true)
      }
    }, 24)
    return () => clearInterval(timer)
  }, [tab])

  // Demo mode: once a sample finishes typing, move to the next language after a
  // beat — until the visitor picks a tab themselves.
  useEffect(() => {
    if (!done || userTookOver.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setTimeout(() => {
      if (userTookOver.current || document.hidden) return
      setTab((current) => TAB_ORDER[(TAB_ORDER.indexOf(current) + 1) % TAB_ORDER.length])
    }, 5000)
    return () => clearTimeout(timer)
  }, [done])

  return (
    <section
      className="mk-rise relative z-[1] mx-auto max-w-[840px] px-7 pb-[30px]"
      style={{ '--mk-delay': '0.45s' } as React.CSSProperties}
    >
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[linear-gradient(180deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(124,92,255,0.06)] transition-shadow duration-500 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(124,92,255,0.14),0_0_60px_-20px_rgba(124,92,255,0.25)]">
        {/* window header */}
        <div className="flex items-center gap-3.5 border-b border-ink/[0.07] px-4 py-[13px]">
          <div className="flex gap-[7px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
          </div>
          <div className="ml-1.5 flex gap-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`rounded-[7px] px-3 py-[5px] font-geist-mono text-[12.5px] transition-all active:scale-95 ${
                  tab === item.id
                    ? 'bg-[#8C6CFF]/[0.18] text-brand-strong'
                    : 'bg-transparent text-fg-dim hover:text-fg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ml-auto font-geist-mono text-xs text-fg-faint">POST /v1/pdf</div>
        </div>

        <div className="grid min-h-[268px] grid-cols-1 md:grid-cols-[1.55fr_1fr]">
          {/* code pane */}
          <pre className="m-0 overflow-x-auto border-b border-ink/[0.06] p-[22px] font-geist-mono text-[13px] leading-[1.7] text-brand-strong md:border-b-0 md:border-r">
            <span ref={codeRef} />
            <span className="ml-[3px] inline-block h-[13px] w-[7px] bg-brand-text align-[-2px] [animation:mk-blink_1.1s_steps(1)_infinite]" />
          </pre>

          {/* response pane */}
          <div className="flex flex-col gap-3.5 bg-ink/[0.012] p-[22px]">
            <div className="font-geist-mono text-[11px] uppercase tracking-[0.08em] text-fg-faint">
              {done ? 'Response · 200' : 'Response · …'}
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[10px] border border-ink/[0.09] bg-surface">
              <div className="absolute inset-x-0 h-[30px] bg-[linear-gradient(90deg,transparent,rgba(124,92,255,0.14),transparent)] [animation:mk-scan_2.6s_linear_infinite]" />
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: done ? 1 : 0.18,
                  transform: done ? 'scale(1)' : 'scale(0.94)',
                  filter: done ? 'none' : 'saturate(0.4)',
                }}
              >
                <div className="relative h-[120px] w-24 rounded-md bg-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] [animation:mk-float_4s_ease-in-out_infinite]">
                  <div className="absolute left-3 right-3 top-3.5 h-1.5 rounded-[3px] bg-[#8C6CFF]" />
                  <div className="absolute left-3 top-7 h-1 w-[60%] rounded-sm bg-[#D8D8E0]" />
                  <div className="absolute left-3 right-3 top-10 h-[3px] rounded-sm bg-[#ECECF0]" />
                  <div className="absolute left-3 right-6 top-12 h-[3px] rounded-sm bg-[#ECECF0]" />
                  <div className="absolute left-3 right-3 top-[62px] h-[3px] rounded-sm bg-[#ECECF0]" />
                  <div className="absolute bottom-3.5 left-3 right-[30px] h-[3px] rounded-sm bg-[#ECECF0]" />
                  <div className="absolute bottom-2 right-2.5 font-geist-mono text-[7px] font-semibold text-[#8C6CFF]">
                    PDF
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`break-all font-geist-mono text-[11px] transition-colors duration-[400ms] ${
                done ? 'text-ok' : 'text-fg-faint'
              }`}
            >
              {done ? '{ "url": "cdn.mkpdfs.com/…" }' : '⠋ awaiting request…'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
