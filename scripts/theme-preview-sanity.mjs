// OPTIONAL reference (no test runner here; Node 20 can't strip TS types). Run only if you add tsx.
import { FONTS, DEFAULT_FONT_KEY, isFontKey } from '../src/lib/theme/fonts.ts'
import { composeThemedHtml, softTint, shadowRgba } from '../src/lib/theme/themePreview.ts'
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m) }
assert(Object.keys(FONTS).length === 8, '8 fonts')
assert(isFontKey(DEFAULT_FONT_KEY) && !isFontKey('nope'), 'isFontKey')
assert(softTint('#000000') === '#ebebeb', 'softTint')
assert(shadowRgba('#8c6cff', 0.28) === 'rgba(140, 108, 255, 0.28)', 'shadowRgba')
const tpl = '<html><head><style>:root{--brand:#000}</style></head><body>{{mkpdfsLogo companyName}}|{{today}}|{{companyName}}</body></html>'
const plain = composeThemedHtml(tpl, { companyName: 'Acme' })
assert(!plain.includes('id="mkpdfs-theme"') && plain.includes('brand-dot') && plain.includes('>A<'), 'plain')
const themed = composeThemedHtml(tpl, { companyName: 'Acme' }, { brand: '#0f62fe', accent: '#ff6b35', fontKey: 'poppins-poppins' }, 'blob:fake')
assert(themed.includes('id="mkpdfs-theme"') && themed.includes('--brand: #0f62fe;') && themed.includes('fonts.googleapis.com'), 'themed vars')
assert(themed.includes('<img class="brand-logo" src="blob:fake"') && !themed.includes('brand-dot'), 'logo img')
console.log('THEME_PREVIEW_OK')
