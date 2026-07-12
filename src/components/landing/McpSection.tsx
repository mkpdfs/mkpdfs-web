import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { CopyButton } from './CopyButton'
import { ScrollReveal } from './ScrollReveal'

// Tool names are literal MCP identifiers — never translated.
const MCP_TOOLS = [
  'get_authoring_guide',
  'generate_pdf',
  'list_templates',
  'get_template',
  'upload_template',
  'update_template',
  'delete_template',
]

// What the copy button puts on the clipboard — keep in sync with the JSX below.
const MCP_CONFIG = `{
  "mcpServers": {
    "mkpdfs": {
      "url": "https://apis.mkpdfs.com/v1/mcp",
      "headers": { "x-api-key": "tlfy_YOUR_API_KEY" }
    }
  }
}`

const mono = 'font-geist-mono text-[12.5px] leading-[1.85]'

function Comment({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 text-fg-dim first:mt-0"># {children}</div>
}

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-wrap text-fg">
      <span className="text-ok">$ </span>
      {children}
    </div>
  )
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-wrap text-fg">
      <span className="text-brand-text">❯ </span>
      <span className="italic">&ldquo;{children}&rdquo;</span>
    </div>
  )
}

function Out({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <div className={`whitespace-pre-wrap ${ok ? 'text-ok' : 'text-fg-muted'}`}>
      <span className="text-fg-faint">⎿ </span>
      {ok ? '✔ ' : ''}
      {children}
    </div>
  )
}

export async function McpSection() {
  const t = await getTranslations('marketing.mcp')

  const chip =
    'rounded-full border border-ink/[0.08] bg-ink/[0.05] px-[11px] py-[5px] font-geist-mono text-[12px] text-fg-muted'

  return (
    <section id="mcp" className="relative z-[1] mx-auto max-w-[1100px] px-7 pb-[90px] pt-[70px]">
      <ScrollReveal>
        <div className="mb-[42px] text-center">
          <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
            {t('eyebrow')}
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[15.5px] leading-[1.65] text-fg-muted">
            {t('body')}
          </p>
        </div>
      </ScrollReveal>

      {/* Ghostty-style walkthrough — the six literal steps, as a real session */}
      <ScrollReveal>
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[linear-gradient(180deg,rgb(var(--surface-card)),rgb(var(--surface-raised)))] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(124,92,255,0.06)]">
          <div className="flex items-center gap-3.5 border-b border-ink/[0.07] px-4 py-[13px]">
            <div className="flex gap-[7px]">
              <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
            </div>
            <div className="ml-auto font-geist-mono text-xs text-fg-faint">ghostty · claude</div>
          </div>

          <div className={`overflow-x-auto p-[22px] ${mono}`}>
            <Comment>{t('term.s1')}</Comment>
            <Cmd>
              claude mcp add --transport http mkpdfs{' '}
              <span className="text-brand-text">https://apis.mkpdfs.com/v1/mcp</span>
              {' \\\n      --header '}
              <span className="text-brand-text">&quot;x-api-key: $MKPDFS_API_KEY&quot;</span>
            </Cmd>
            <Out ok>{t('term.ok1')}</Out>

            <Comment>{t('term.s2')}</Comment>
            <Cmd>claude</Cmd>
            <div className="whitespace-pre-wrap text-fg">
              <span className="text-brand-text">❯ </span>/mcp
            </div>
            <Out ok>{t('term.ok2')}</Out>

            <Comment>{t('term.s3')}</Comment>
            <Prompt>{t('term.p3')}</Prompt>
            <Out>
              get_authoring_guide() → upload_template(<span className="text-brand-text">&quot;hello-world&quot;</span>)
            </Out>
            <Out>
              {'{{#each invitados}}'}<span className="text-fg-dim">{'<li>'}</span>{'{{this}}'}
              <span className="text-fg-dim">{'</li>'}</span>{'{{/each}}'} → templateId:{' '}
              <span className="text-brand-text">2ee0c42b…</span>
            </Out>

            <Comment>{t('term.s4')}</Comment>
            <Prompt>{t('term.p4')}</Prompt>
            <Out>
              generate_pdf(templateId, {'{ invitados: ["Ana", "Luis", "Marta"] }'})
            </Out>
            <Out ok>
              {t('term.ok4')} — <span className="text-brand-text">https://cdn…/hello-world.pdf</span>
            </Out>

            <Comment>{t('term.s5')}</Comment>
            <Cmd>
              curl -X POST <span className="text-brand-text">https://apis.mkpdfs.com/v1/pdf/generate</span>
              {' \\\n      -H '}
              <span className="text-brand-text">&quot;x-api-key: tlfy_…&quot;</span>
              {' \\\n      -d '}
              {"'"}
              {'{"templateId": "2ee0c42b…", "data": {"invitados": ["Ana", "Luis", "Marta"]}}'}
              {"'"}
            </Cmd>
            <Out ok>
              {'{ "pdfUrl": "https://cdn…" }'}
            </Out>
          </div>
        </div>
      </ScrollReveal>

      {/* Config for any client + the tool list */}
      <ScrollReveal>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[14px] border border-ink/[0.09] bg-surface p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold">{t('configTitle')}</div>
                <div className={`text-fg-dim ${mono}`}>{'// '}{t('configComment')}</div>
              </div>
              <CopyButton text={MCP_CONFIG} label={t('copy')} copiedLabel={t('copied')} />
            </div>
            <pre className={`m-0 overflow-x-auto whitespace-pre text-fg-muted ${mono}`}>
              {'{\n  "mcpServers": {\n    "mkpdfs": {\n      "url": '}
              <span className="text-brand-text">&quot;https://apis.mkpdfs.com/v1/mcp&quot;</span>
              {',\n      "headers": { "x-api-key": '}
              <span className="text-brand-text">&quot;tlfy_YOUR_API_KEY&quot;</span>
              {' }\n    }\n  }\n}'}
            </pre>
          </div>

          <div className="flex flex-col rounded-[14px] border border-ink/[0.09] bg-surface p-5">
            <div className="mb-3 text-[14px] font-semibold">{t('toolsTitle')}</div>
            <div className="mb-5 flex flex-wrap gap-2">
              {MCP_TOOLS.map((tool) => (
                <span key={tool} className={chip}>
                  {tool}
                </span>
              ))}
            </div>
            <Link
              href="/docs/integrations/mcp"
              className="group mt-auto inline-flex w-fit items-center gap-[9px] rounded-[11px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-6 py-3 text-[14.5px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              {t('docsCta')}{' '}
              <span className="opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
