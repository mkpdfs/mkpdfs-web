import { getTranslations } from 'next-intl/server'
import { McpTerminal } from './McpTerminal'

/** The hero terminal: the MCP walkthrough typed live (replaces the old
 *  cURL/Node/Python demo — agent DX is the flagship story). */
export async function McpTerminalHero() {
  const t = await getTranslations('marketing.mcp')

  return (
    <section
      className="mk-rise relative z-[1] mx-auto max-w-[840px] px-7 pb-[30px]"
      style={{ '--mk-delay': '0.45s' } as React.CSSProperties}
    >
      <McpTerminal
        labels={{
          s1: t('term.s1'),
          ok1: t('term.ok1'),
          s2: t('term.s2'),
          ok2: t('term.ok2'),
          s3: t('term.s3'),
          p3: t('term.p3'),
          s4: t('term.s4'),
          p4: t('term.p4'),
          ok4: t('term.ok4'),
          s5: t('term.s5'),
        }}
      />
    </section>
  )
}
