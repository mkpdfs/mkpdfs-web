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

export async function McpSection() {
  const t = await getTranslations('marketing.mcp')

  const chip =
    'rounded-full border border-ink/[0.08] bg-ink/[0.05] px-[11px] py-[5px] font-geist-mono text-[12px] text-fg-muted'

  return (
    <section id="mcp" className="relative z-[1] mx-auto max-w-[1160px] px-7 py-[48px]">
      <ScrollReveal>
        <div className="mb-[28px] text-center">
          <div className="mb-3 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
            {t('eyebrow')}
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.03em] md:text-[42px] md:leading-tight">
            {t('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-[640px] text-[14.5px] leading-[1.6] text-fg-muted">
            {t('body')}
          </p>
        </div>
      </ScrollReveal>

      {/* The animated walkthrough lives in the hero (McpTerminalHero); this
          section carries the config + tool list. */}
      <ScrollReveal>
        <div className="mx-auto grid max-w-[980px] grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
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
                {',\n      "headers": {\n        "x-api-key": '}
                <span className="text-brand-text">&quot;tlfy_YOUR_API_KEY&quot;</span>
                {'\n      }\n    }\n  }\n}'}
              </pre>
              <div className={`mt-3 border-t border-ink/[0.07] pt-3 text-fg-dim ${mono}`}>
                {'// '}{t('pluginComment')}
                <br />
                <span className="text-fg-muted">/plugin marketplace add </span>
                <span className="text-brand-text">mkpdfs/mkpdfs-claude-plugin</span>
                <br />
                <span className="text-fg-muted">/plugin install </span>
                <span className="text-brand-text">mkpdfs@mkpdfs</span>
              </div>
            </div>

            <div className="flex flex-col rounded-[14px] border border-ink/[0.09] bg-surface p-5">
              <div className="mb-3 text-[14px] font-semibold">{t('toolsTitle')}</div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {MCP_TOOLS.map((tool) => (
                  <span key={tool} className={chip}>
                    {tool}
                  </span>
                ))}
              </div>
              <Link
                href="/docs/integrations/mcp"
                className="group mt-auto inline-flex w-fit items-center gap-[9px] rounded-[11px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
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
