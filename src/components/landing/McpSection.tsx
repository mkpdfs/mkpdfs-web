import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Bot } from 'lucide-react'
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

export async function McpSection() {
  const t = await getTranslations('marketing.mcp')

  const chip =
    'rounded-full border border-ink/[0.08] bg-ink/[0.05] px-[11px] py-[5px] font-geist-mono text-[12px] text-fg-muted'

  return (
    <section className="relative z-[1] mx-auto max-w-[1200px] px-7 pb-[90px] pt-[30px]">
      <ScrollReveal>
        <div className="mb-[50px] text-center">
          <div className="mb-3.5 font-geist-mono text-[12.5px] uppercase tracking-[0.12em] text-[#8C6CFF]">
            {t('eyebrow')}
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.03em] md:text-[46px] md:leading-tight">
            {t('title')}
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[18px] border border-ink/[0.09] bg-[linear-gradient(180deg,rgba(124,92,255,0.06),rgba(255,255,255,0))] lg:grid-cols-2">
          <div className="p-8">
            <div className="mb-[18px] flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-[#8C6CFF]/30 bg-[#8C6CFF]/[0.16] text-brand-text">
                <Bot className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold">{t('cardTitle')}</h3>
                <p className="mt-0.5 text-[13px] text-fg-dim">{t('cardTagline')}</p>
              </div>
            </div>
            <p className="mb-[18px] text-[15px] leading-[1.6] text-fg-muted">{t('body')}</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {MCP_TOOLS.map((tool) => (
                <span key={tool} className={chip}>
                  {tool}
                </span>
              ))}
            </div>
            <Link
              href="/docs/integrations/mcp"
              className="group inline-flex items-center gap-[9px] rounded-[11px] bg-[linear-gradient(140deg,#8C6CFF,#5B3FE0)] px-6 py-3 text-[14.5px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              {t('docsCta')}{' '}
              <span className="opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="border-t border-ink/[0.08] p-8 lg:border-l lg:border-t-0">
            <div className="rounded-[11px] border border-ink/[0.08] bg-surface p-4 font-geist-mono text-[12.5px] leading-[1.8] text-fg-muted">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-fg-dim">{'// '}{t('configComment')}</span>
                <CopyButton text={MCP_CONFIG} label={t('copy')} copiedLabel={t('copied')} />
              </div>
              {'{'}
              <br />
              {'  "mcpServers": {'}
              <br />
              {'    "mkpdfs": {'}
              <br />
              {'      "url": '}
              <span className="text-brand-text">&quot;https://apis.mkpdfs.com/v1/mcp&quot;</span>,
              <br />
              {'      "headers": { "x-api-key": '}
              <span className="text-brand-text">&quot;tlfy_…&quot;</span>
              {' }'}
              <br />
              {'    }'}
              <br />
              {'  }'}
              <br />
              {'}'}
            </div>
            <div className="mt-4 rounded-[11px] border border-ink/[0.08] bg-surface p-4 font-geist-mono text-[12.5px] leading-[1.7] text-fg-muted">
              <span className="text-fg-dim">{t('promptLabel')}</span>{' '}
              {t('promptExample')}
              <br />
              <span className="text-ok">→</span> generate_pdf(templateId, data)
              <br />
              <span className="text-ok">→</span> invoice-0042.pdf{' '}
              <span className="text-fg-dim">{t('resultNote')}</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
