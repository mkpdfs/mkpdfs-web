import { docsNav } from '@/lib/docs/nav'

// llms.txt (https://llmstxt.org): a curated, plain-text map of the product for
// AI agents — what mkpdfs is, how to call the API, the hosted MCP endpoint,
// and every docs page. Docs links are generated from the same nav that drives
// the sidebar and the sitemap, so it can't drift.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mkpdfs.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apis.mkpdfs.com'

export const dynamic = 'force-static'

export function GET(): Response {
  const docsSections = docsNav
    .map((section) => {
      const links = section.pages
        .map((p) => `- [${p.label.en}](${BASE_URL}/docs/${p.slug})`)
        .join('\n')
      return `## ${section.label.en}\n\n${links}`
    })
    .join('\n\n')

  const body = `# mkpdfs

> PDF generation as a service. Upload a Handlebars (HTML/CSS) template — or pick a
> pre-built one — then POST JSON data and get a hosted PDF URL back in seconds.
> Prepaid credits: $10 ≈ 1,000 PDF pages ($0.01/page), 10 free pages on signup,
> no card required. Web dashboard at ${BASE_URL}, REST API at ${API_URL}.

Key facts for agents:

- REST API base URL: ${API_URL}
- Authentication: \`x-api-key\` header with an API token (\`tlfy_...\`), created in the dashboard under API Keys.
- Generate a PDF: \`POST ${API_URL}/v1/pdf/generate\` with \`{"templateId": "...", "data": {...}}\` → returns a presigned PDF URL.
- Headless template CRUD: \`GET|PUT|DELETE ${API_URL}/v1/templates[/{templateId}]\` and \`POST ${API_URL}/v1/templates/upload\` (same \`x-api-key\` auth).
- Hosted MCP server (Model Context Protocol, streamable HTTP — nothing to install):
  endpoint \`${API_URL}/v1/mcp\`, auth via \`x-api-key\` header. Exposes seven tools:
  get_authoring_guide (template format + helpers + worked example — call it first),
  generate_pdf, list_templates, get_template, upload_template, update_template,
  delete_template. Setup guide: ${BASE_URL}/docs/integrations/mcp
- Claude Code plugin (MCP server + template-authoring skill preinstalled):
  \`/plugin marketplace add mkpdfs/mkpdfs-claude-plugin\` then \`/plugin install mkpdfs@mkpdfs\`
  (requires MKPDFS_API_KEY in the environment). Repo: https://github.com/mkpdfs/mkpdfs-claude-plugin
- CLI: \`brew install mkpdfs/mkpdfs/mkpdfs\` (installs the \`mkp\` binary);
  \`mkp instructions --agent\` prints an offline
  end-to-end walkthrough written for AI coding agents (template authoring + push + generate).
- Templates are Handlebars over arbitrary HTML/CSS, rendered with headless Chromium
  (full CSS support incl. flex/grid/box-shadow). One credit = one rendered page.

${docsSections}

## Optional

- [Login](${BASE_URL}/login)
- [Create an account](${BASE_URL}/register)
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
