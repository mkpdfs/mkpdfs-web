'use client'

import { useEffect, useRef, useState } from 'react'

// Ghostty-style animated walkthrough. Human-typed lines ($ commands, ❯ prompts)
// are revealed character by character; comments and tool output appear whole
// after a beat, like a real session. Starts when scrolled into view; renders
// instantly under prefers-reduced-motion.

type Seg = { t: string; c?: string }
type Kind = 'comment' | 'cmd' | 'input' | 'prompt' | 'out' | 'ok'
type Line = { kind: Kind; segs: Seg[] }

export type McpTerminalLabels = {
  s1: string
  ok1: string
  s2: string
  ok2: string
  s3: string
  p3: string
  s4: string
  p4: string
  ok4: string
  s5: string
}

const BRAND = 'text-brand-text'

function buildLines(l: McpTerminalLabels): Line[] {
  return [
    { kind: 'comment', segs: [{ t: l.s1 }] },
    {
      kind: 'cmd',
      segs: [
        { t: 'claude mcp add --transport http mkpdfs ' },
        { t: 'https://apis.mkpdfs.com/v1/mcp', c: BRAND },
        { t: ' \\\n      --header ' },
        { t: '"x-api-key: $MKPDFS_API_KEY"', c: BRAND },
      ],
    },
    { kind: 'ok', segs: [{ t: l.ok1 }] },

    { kind: 'comment', segs: [{ t: l.s2 }] },
    { kind: 'cmd', segs: [{ t: 'claude' }] },
    { kind: 'input', segs: [{ t: '/mcp' }] },
    { kind: 'ok', segs: [{ t: l.ok2 }] },

    { kind: 'comment', segs: [{ t: l.s3 }] },
    { kind: 'prompt', segs: [{ t: l.p3 }] },
    {
      kind: 'out',
      segs: [
        { t: 'get_authoring_guide() → upload_template(' },
        { t: '"hello-world"', c: BRAND },
        { t: ')' },
      ],
    },
    {
      kind: 'out',
      segs: [
        { t: '{{#each invitados}}<li>{{this}}</li>{{/each}} → templateId: ' },
        { t: '2ee0c42b…', c: BRAND },
      ],
    },

    { kind: 'comment', segs: [{ t: l.s4 }] },
    { kind: 'prompt', segs: [{ t: l.p4 }] },
    { kind: 'out', segs: [{ t: 'generate_pdf(templateId, { invitados: ["Ana", "Luis", "Marta"] })' }] },
    {
      kind: 'ok',
      segs: [{ t: `${l.ok4} — ` }, { t: 'https://cdn…/hello-world.pdf', c: BRAND }],
    },

    { kind: 'comment', segs: [{ t: l.s5 }] },
    {
      kind: 'cmd',
      segs: [
        { t: 'curl -X POST ' },
        { t: 'https://apis.mkpdfs.com/v1/pdf/generate', c: BRAND },
        { t: ' \\\n      -H ' },
        { t: '"x-api-key: tlfy_…"', c: BRAND },
        { t: " \\\n      -d '" },
        { t: '{"templateId": "2ee0c42b…", "data": {"invitados": ["Ana", "Luis", "Marta"]}}' },
        { t: "'" },
      ],
    },
    { kind: 'ok', segs: [{ t: '{ "pdfUrl": "https://cdn…" }' }] },
  ]
}

const TYPED: Record<Kind, boolean> = {
  comment: false,
  cmd: true,
  input: true,
  prompt: true,
  out: false,
  ok: false,
}

const lineChars = (line: Line) => line.segs.reduce((n, s) => n + s.t.length, 0)

function Prefix({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'comment':
      return <span className="text-fg-dim"># </span>
    case 'cmd':
      return <span className="text-ok">$ </span>
    case 'input':
    case 'prompt':
      return <span className="text-brand-text">❯ </span>
    case 'out':
      return <span className="text-fg-faint">⎿ </span>
    case 'ok':
      return (
        <span>
          <span className="text-fg-faint">⎿ </span>
          <span className="text-ok">✔ </span>
        </span>
      )
  }
}

function LineView({ line, upto }: { line: Line; upto: number }) {
  const body: React.ReactNode[] = []
  let used = 0
  for (let i = 0; i < line.segs.length && used < upto; i++) {
    const seg = line.segs[i]
    const take = Math.min(seg.t.length, upto - used)
    body.push(
      <span key={i} className={seg.c}>
        {seg.t.slice(0, take)}
      </span>,
    )
    used += take
  }
  const base =
    line.kind === 'comment'
      ? 'mt-3.5 text-fg-dim first:mt-0'
      : line.kind === 'ok'
        ? 'text-ok'
        : line.kind === 'out'
          ? 'text-fg-muted'
          : 'text-fg'
  return (
    <div className={`whitespace-pre-wrap ${base}`}>
      <Prefix kind={line.kind} />
      {line.kind === 'prompt' ? <span className="italic">&ldquo;{body}&rdquo;</span> : body}
    </div>
  )
}

export function McpTerminal({ labels }: { labels: McpTerminalLabels }) {
  const lines = useRef(buildLines(labels)).current
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  // progress = [line index, chars revealed within that line]
  const [progress, setProgress] = useState<[number, number]>([0, 0])

  // Real-terminal behavior: fixed height, history scrolls up and out as new
  // lines are typed (kept pinned to the bottom).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [progress])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStarted(true)
      setProgress([lines.length, 0])
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [lines.length])

  useEffect(() => {
    if (!started) return
    const [li, ci] = progress
    if (li >= lines.length) return
    const line = lines[li]
    const total = lineChars(line)

    let timer: ReturnType<typeof setTimeout>
    if (TYPED[line.kind] && ci < total) {
      // human typing: a couple of characters per tick
      timer = setTimeout(() => setProgress([li, Math.min(total, ci + 2)]), 16)
    } else {
      // line done (or machine output): brief beat, then next line whole-or-typing
      const next = lines[li + 1]
      const pause = !next ? 0 : next.kind === 'comment' ? 420 : TYPED[next.kind] ? 180 : 200
      timer = setTimeout(() => setProgress([li + 1, 0]), pause)
    }
    return () => clearTimeout(timer)
  }, [started, progress, lines])

  const [curLine] = progress
  const done = curLine >= lines.length

  return (
    <div ref={containerRef}>
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[linear-gradient(180deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(124,92,255,0.06)]">
        <div className="flex items-center gap-3.5 border-b border-ink/[0.07] px-4 py-[11px]">
          <div className="flex gap-[7px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
          </div>
          <div className="ml-auto font-geist-mono text-xs text-fg-faint">ghostty · claude</div>
        </div>

        {/* Fixed height from the start; old history scrolls up and fades out
            through the top mask, like a real terminal. */}
        <div
          ref={scrollRef}
          className="h-[300px] overflow-hidden p-[20px] font-geist-mono text-[12px] leading-[1.85] [mask-image:linear-gradient(180deg,transparent_0,black_52px)]"
        >
          {lines.slice(0, curLine).map((line, i) => (
            <LineView key={i} line={line} upto={lineChars(line)} />
          ))}
          {!done && progress[1] > 0 && (
            <LineView line={lines[curLine]} upto={progress[1]} />
          )}
          <span className="ml-[2px] inline-block h-[12px] w-[6px] bg-brand-text align-[-2px] [animation:mk-blink_1.1s_steps(1)_infinite]" />
        </div>
      </div>
    </div>
  )
}
