// Preview-only MIRROR of the backend theme→CSS math
// (mkpdfs-backend/src/libs/theme/{colorDerive,buildThemeStyle,injectTheme}.ts + systemParams.ts
//  + the mkpdfsLogo helper in services/pdfService.ts). Keep in sync. Backend is source of truth.
import Handlebars from 'handlebars'
import { FONTS } from './fonts'
import type { ThemeInput } from '@/types'

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
export function softTint(hex: string, weight = 0.08): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (c: number) => c * weight + 255 * (1 - weight)
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}
export function shadowRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function buildSystemParams(now: Date) {
  return { today: now.toISOString().slice(0, 10), now: now.toISOString(), year: now.getUTCFullYear() }
}
function buildThemeHead(theme: ThemeInput): string {
  const font = FONTS[theme.fontKey] ?? FONTS['inter-fraunces']
  const vars = [
    `--brand: ${theme.brand};`, `--brand-soft: ${softTint(theme.brand)};`,
    `--brand-shadow: ${shadowRgba(theme.brand, 0.28)};`,
    `--accent: ${theme.accent};`, `--accent-soft: ${softTint(theme.accent)};`,
    `--font-heading: ${font.headingStack};`, `--font-body: ${font.bodyStack};`,
  ].join(' ')
  return `<link rel="stylesheet" href="${font.linkHref}"><style id="mkpdfs-theme">:root { ${vars} }</style>`
}
function injectIntoHead(html: string, fragment: string): string {
  const i = html.search(/<\/head>/i)
  return i === -1 ? fragment + html : html.slice(0, i) + fragment + html.slice(i)
}
let registered = false
function registerHelpers() {
  if (registered) return
  registered = true
  Handlebars.registerHelper('ifEq', function (this: unknown, a: unknown, b: unknown, o: Handlebars.HelperOptions) {
    return a == b ? o.fn(this) : o.inverse(this)
  })
  Handlebars.registerHelper('gt', (a: unknown, b: unknown) => (a as number) > (b as number)) // raw compare, matches backend
  Handlebars.registerHelper('formatDate', (d: unknown) => { try { return new Date(d as never).toLocaleDateString() } catch { return String(d) } })
  Handlebars.registerHelper('formatCurrency', (a: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(a)))
  Handlebars.registerHelper('mkpdfsLogo', function (name: unknown, o: Handlebars.HelperOptions) {
    const theme = (o?.data as { mkpdfsTheme?: { logoDataUri: string | null } } | undefined)?.mkpdfsTheme
    if (theme && theme.logoDataUri) {
      return new Handlebars.SafeString(`<img class="brand-logo" src="${theme.logoDataUri}" alt="">`)
    }
    const initial = (typeof name === 'string' && name.trim() ? name.trim()[0] : '') || ''
    return new Handlebars.SafeString(`<div class="brand-dot">${Handlebars.escapeExpression(initial)}</div>`)
  })
}
/** Render the template with sample data + (optional) theme, returning HTML for an iframe. */
export function composeThemedHtml(
  templateContent: string,
  sampleData: Record<string, unknown>,
  theme?: ThemeInput,
  logoPreviewUrl?: string | null,
): string {
  registerHelpers()
  const ctx = { ...(sampleData || {}), ...buildSystemParams(new Date()) }
  const resolved = theme ? { ...theme, logoDataUri: logoPreviewUrl ?? null } : undefined
  const compiled = Handlebars.compile(templateContent)
  let html = compiled(ctx, resolved ? { data: { mkpdfsTheme: resolved } } : undefined)
  if (theme) html = injectIntoHead(html, buildThemeHead(theme))
  return html
}
