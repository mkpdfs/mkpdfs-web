# Light Theme Implementation Plan

> **For agentic workers:** This is a color-token migration, not feature TDD. Each
> task ends in a concrete verification gate (build / lint / inventory diff /
> visual). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a toggleable, system-aware (default-dark) light theme across
dashboard, auth, and landing by refactoring ~700 hardcoded hex/rgba values into
semantic CSS-variable-backed Tailwind tokens.

**Architecture:** CSS variables on `:root` (light) / `.dark` (dark) as
space-separated RGB triples; named Tailwind utilities backed by
`rgb(var(--token) / <alpha-value>)`; a single shared resolver drives both an
inline no-flash `<head>` script and `ThemeProvider`. Then sweep all files,
replacing literals with tokens.

**Tech Stack:** Next.js 15 (App Router), Tailwind v3 (`darkMode: 'class'`),
TypeScript, lucide-react.

Spec: `docs/superpowers/specs/2026-06-12-light-theme-design.md`

---

## Token reference (used by every sweep task)

Solid colors → semantic token (Tailwind utility):

| Dark hex | Light hex | Token | Utility examples |
|---|---|---|---|
| `#08080A` `#0A0A0C` | `#F5F5F8` `#FFFFFF` | `surface` | `bg-surface` |
| `#0C0C0F` | `#FFFFFF` | `surface-raised` | `bg-surface-raised` |
| `#101014` `#0e0e14` `#0E0E12` | `#F8F8FB` `#FFFFFF` | `surface-card` | `bg-surface-card` |
| `#1A1A20` | `#EDEDF2` | `surface-overlay` | `bg-surface-overlay` |
| `#F4F4F6` `#ECECF0` | `#16161A` | `fg` | `text-fg` |
| `#9C9CA8` `#A0A0AB` `#C8C8D0` | `#5F5F6B` | `fg-muted` | `text-fg-muted` |
| `#7E7E89` `#7C7C86` `#6B6B76` | `#70707B` | `fg-dim` | `text-fg-dim` |
| `#5C5C66` | `#9A9AA2` | `fg-faint` | `text-fg-faint` |
| `#8C6CFF` | `#8C6CFF` | `brand` (or keep literal — theme-invariant) | `text-brand` `bg-brand` |
| `#B7A6FF` | `#7C5CFF` | `brand-text` | `text-brand-text` |
| `#C9BBFF` `#D6D6E0` | `#6B4FE0` | `brand-strong` | `text-brand-strong` |
| `#5B3FE0` | `#5B3FE0` | `brand-deep` (or keep literal) | gradient end |
| `#7CF0B0` `#3FBF7F` | `#1F8A5B` | `ok` | `text-ok` |
| `#FF6B6B` `#FF8C8C` `#FF8B8B` | `#C92F4D` | `danger` | `text-danger` |
| `#FF8A9B` `#FF6C8C` | `#FF6C8C` | `danger-soft` | `text-danger-soft` |
| `#FEBC2E` `#FFD479` `#F0C987` `#E0A14F` | `#E0A14F` | `warn` | `text-warn` |

Note: `success`/`warning`/`destructive`/`info` Tailwind utilities already exist
(fixed colors) and are LEFT UNTOUCHED — use `ok`/`warn`/`danger` for the
dashboard's theme-variant status colors. The brand violet `#8C6CFF`/`#5B3FE0` is
theme-invariant; keeping it literal is fine.

Overlays/borders → flip base, keep alpha:
- `white/[α]` / `rgba(255,255,255,α)` → `ink/[α]` / `rgb(var(--ink) / α)`
- `bg-white/[0.05]` → `bg-ink/[0.05]`, `border-white/[0.07]` → `border-ink/[0.07]`
- accent overlays `rgba(124,92,255,α)` / `bg-[#8C6CFF]/[α]` → **unchanged** (or
  `rgb(var(--accent) / α)`; value identical both themes).
- Drop-shadows / scrims `rgba(0,0,0,α)` → **stay** `rgb(var(--shadow) / α)`
  (`--shadow` = `0 0 0` both; lighten alpha in light only where noted). Do NOT
  convert black scrims to `ink`.

**Literal allowlist — DO NOT touch:** Google "G" SVG fills (auth), macOS
traffic-light dots `#FF5F57`/`#FEBC2E`/`#28C840` in terminal mockups,
syntax-highlight swatches in code/terminal demos, brand gradient stops
`#8C6CFF`→`#5B3FE0` (theme-invariant by design).

---

## Task 1: Token foundation (globals.css + tailwind.config.ts)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add RGB-triple token blocks to `globals.css`**

In `@layer base`, extend `:root` (light) and `.dark` (dark). Keep these RGB
tokens in their OWN block, separate from the existing HSL shadcn vars (do not mix
HSL and RGB in one color function). Also re-point the existing HSL shadcn vars so
`card`/`popover`/`border`/`input`/`ring`/`destructive`/`background`/`foreground`
agree with the new palette.

```css
:root {
  /* --- light: RGB triples for the mkpdfs token system --- */
  --ink: 10 10 30;
  --shadow: 0 0 0;
  --surface: 245 245 248;
  --surface-raised: 255 255 255;
  --surface-card: 248 248 251;
  --surface-overlay: 237 237 242;
  --fg: 22 22 26;
  --fg-muted: 95 95 107;
  --fg-dim: 112 112 123;
  --fg-faint: 154 154 162;
  --accent: 140 108 255;
  --accent-text: 124 92 255;
  --accent-strong: 107 79 224;
  --accent-deep: 91 63 224;
  --success: 31 138 91;
  --danger: 201 47 77;
  --danger-soft: 255 108 140;
  --warning: 224 161 79;
}
.dark {
  --ink: 255 255 255;
  --shadow: 0 0 0;
  --surface: 8 8 10;
  --surface-raised: 12 12 15;
  --surface-card: 16 16 20;
  --surface-overlay: 26 26 32;
  --fg: 244 244 246;
  --fg-muted: 156 156 168;
  --fg-dim: 126 126 137;
  --fg-faint: 92 92 102;
  --accent: 140 108 255;
  --accent-text: 183 166 255;
  --accent-strong: 201 187 255;
  --accent-deep: 91 63 224;
  --success: 124 240 176;
  --danger: 255 107 107;
  --danger-soft: 255 138 155;
  --warning: 254 188 46;
}
```

Add `color-scheme` so native controls/scrollbars match:
```css
:root { color-scheme: light; }
.dark { color-scheme: dark; }
```

- [ ] **Step 2: Register named utilities in `tailwind.config.ts`**

Add to `theme.extend.colors` (alongside existing entries):

```ts
ink: 'rgb(var(--ink) / <alpha-value>)',
shadow: 'rgb(var(--shadow) / <alpha-value>)',
surface: {
  DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
  raised: 'rgb(var(--surface-raised) / <alpha-value>)',
  card: 'rgb(var(--surface-card) / <alpha-value>)',
  overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
},
fg: {
  DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
  muted: 'rgb(var(--fg-muted) / <alpha-value>)',
  dim: 'rgb(var(--fg-dim) / <alpha-value>)',
  faint: 'rgb(var(--fg-faint) / <alpha-value>)',
},
accent: {
  DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
  text: 'rgb(var(--accent-text) / <alpha-value>)',
  strong: 'rgb(var(--accent-strong) / <alpha-value>)',
  deep: 'rgb(var(--accent-deep) / <alpha-value>)',
},
success: 'rgb(var(--success) / <alpha-value>)',
danger: {
  DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
  soft: 'rgb(var(--danger-soft) / <alpha-value>)',
},
warning: 'rgb(var(--warning) / <alpha-value>)',
```
Note: `accent` previously existed as an HSL shadcn entry — replace it with this
RGB version (the shadcn `accent` was only used by a few base components; verify
those still read acceptably, they map to the same violet family).

- [ ] **Step 3: Verify foundation compiles**

Run: `npm run build`
Expected: build succeeds (no files use the new utilities yet, so output is
unchanged). If `accent` collision breaks a base component, adjust and rebuild.

- [ ] **Step 4: Commit**
```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat(theme): add light/dark semantic color tokens"
```

---

## Task 2: Shared resolver — no-flash script + ThemeProvider

**Files:**
- Modify: `src/app/layout.tsx` (replace the inline theme script + viewport)
- Modify: `src/providers/ThemeProvider.tsx`

- [ ] **Step 1: Replace the no-flash script in `layout.tsx`**

Replace the existing `(function(){ var isDark = matchMedia... })()` script with
the shared resolver (stored → system → default-dark only when media unavailable):

```js
(function() {
  try {
    var s = localStorage.getItem('mkpdfs-theme');
    var resolved;
    if (s === 'light' || s === 'dark') {
      resolved = s;
    } else if (window.matchMedia) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = 'dark';
    }
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(resolved);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
```

- [ ] **Step 2: Make `viewport.themeColor` media-specific** in `layout.tsx`:
```ts
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F5F8' },
  ],
}
```

- [ ] **Step 3: Rewrite `ThemeProvider` to use the same resolver and persist**

Key changes: init `theme` from `localStorage` (`'light'|'dark'` → that;
else `'system'`); default-dark fallback when `matchMedia` unavailable; `setTheme`
writes `localStorage('mkpdfs-theme')`; `toggleTheme` sets explicit `light`/`dark`.
Provider reads storage in a `useState` initializer (client) and applies the class
in `useEffect` — it must NOT assume `'light'` at rest.

```tsx
function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'light' || theme === 'dark') return theme
  if (typeof window !== 'undefined' && window.matchMedia)
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return 'dark' // default-dark only when system pref unavailable
}
function getStored(): Theme {
  if (typeof window === 'undefined') return 'system'
  const s = localStorage.getItem('mkpdfs-theme')
  return s === 'light' || s === 'dark' ? s : 'system'
}
```
- `useState<Theme>(getStored)` and `useState<ResolvedTheme>(() => resolve(getStored()))`.
- `setTheme(t)`: if `t === 'system'` removeItem else setItem; update state.
- `updateResolvedTheme`: `resolve(theme)`, set class on `<html>`.
- Keep the `matchMedia` change listener (re-resolve only when `theme === 'system'`).

- [ ] **Step 4: Verify no hydration warning / flash**

Run: `npm run build && npm run start` (or `npm run dev`), load `/`, toggle, reload.
Expected: no flash, no console hydration error, choice persists, OS change
respected when no stored choice.

- [ ] **Step 5: Commit**
```bash
git add src/app/layout.tsx src/providers/ThemeProvider.tsx
git commit -m "feat(theme): shared resolver, localStorage persistence, no-flash"
```

---

## Task 3: Un-hardcode the shells

**Files:**
- Modify: `src/app/[locale]/(dashboard)/DashboardLayoutClient.tsx`
- Modify: `src/app/[locale]/page.tsx` (landing root)

- [ ] **Step 1:** In `DashboardLayoutClient.tsx` change the wrapper className from
`...dark flex h-screen overflow-hidden bg-[#08080A] font-geist text-[#F4F4F6]`
to `...flex h-screen overflow-hidden bg-surface font-geist text-fg` (remove the
literal `dark`; the `<html>` class now drives the theme).

- [ ] **Step 2:** In landing `page.tsx` change the root className
`mk-landing dark relative min-h-screen overflow-x-hidden bg-[#08080A] font-geist text-[#F4F4F6]`
to `mk-landing relative min-h-screen overflow-x-hidden bg-surface font-geist text-fg`
(remove literal `dark`).

- [ ] **Step 3: Commit**
```bash
git add "src/app/[locale]/(dashboard)/DashboardLayoutClient.tsx" "src/app/[locale]/page.tsx"
git commit -m "feat(theme): drive shell theme from html class, not hardcoded dark"
```

---

## Task 4: Baseline inventory (guardrail)

- [ ] **Step 1: Capture pre-sweep color inventory**
```bash
grep -rEoh "#[0-9A-Fa-f]{3,6}|rgba?\([0-9, .]+\)" src --include="*.tsx" \
  | sort | uniq -c | sort -rn > /tmp/colors-before.txt
wc -l /tmp/colors-before.txt
```
Keep `/tmp/colors-before.txt` to diff against after the sweep — every remaining
literal must be on the allowlist.

---

## Task 5: Sweep — leaf files by batch

Apply the Token reference mapping to every `.tsx` under the three areas. This is
mechanical find-replace with judgment for the allowlist. Batches (dispatchable in
parallel — disjoint file sets, no shared edits):

- **Batch A — landing:** `src/components/landing/*.tsx` (incl. `LandingNav`,
  `LandingHero`, `Terminal`, `PricingCredits`, etc.). For the Terminal/code
  mockups, KEEP traffic-light dots + syntax swatches (allowlist).
- **Batch B — layout + ui:** `src/components/layout/*.tsx`,
  `src/components/ui/*.tsx`.
- **Batch C — auth:** `src/app/[locale]/(auth)/**/*.tsx`. KEEP Google "G" SVG
  fills (allowlist).
- **Batch D — dashboard pages:** `src/app/[locale]/(dashboard)/**/*.tsx`
  (templates, billing, api-keys, usage, marketplace, ai-generate, settings,
  integration, create, dashboard).
- **Batch E — feature components:** `src/components/{templates,marketplace,ai}/*.tsx`.

Per file, in order:
- [ ] Replace solid hexes per the Token reference table → `bg-/text-/border-<token>`.
- [ ] Replace `white/[α]` and `rgba(255,255,255,α)` → `ink/[α]` / `rgb(var(--ink) / α)`.
- [ ] Leave accent overlays `[#8C6CFF]/[α]` and `rgba(124,92,255,α)` as-is.
- [ ] Leave `rgba(0,0,0,α)` shadows/scrims as-is (or `rgb(var(--shadow) / α)`).
- [ ] Skip allowlist literals.
- [ ] For arbitrary-value gradients keep brand stops literal; if a gradient uses a
  surface/fg color, use slash-alpha `rgb(var(--token) / α)`, never comma form.

Specific known spots:
- `Header.tsx`: `ghostControl` string, `border-white/*`, `text-[#9C9CA8]`,
  `hover:text-[#F4F4F6]`, language dropdown `bg-[#101014]`, mobile `bg-[#0A0A0C]`,
  active item `text-[#C9BBFF]` → tokens. KEEP avatar brand gradient + black shadow.
- `LandingNav.tsx`: `border-white/[0.07]`, `bg-[#08080A]/70`, `text-[#A0A0AB]`,
  `hover:text-[#F4F4F6]`, `text-[#C8C8D0]`, the `bg-[#F4F4F6] text-[#0A0A0C]` CTA
  → `bg-fg text-surface` (inverts correctly per theme). KEEP logo brand gradient.

- [ ] **Commit per batch:**
```bash
git add -A && git commit -m "feat(theme): migrate <batch> to semantic tokens"
```

---

## Task 6: Add landing theme toggle

**Files:**
- Modify: `src/components/landing/LandingNav.tsx`

- [ ] **Step 1:** `LandingNav` is a server component; `ThemeToggle` is a client
component (`useTheme`). Import and render it inside the right-hand controls group
(next to `LanguageSelector`):
```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'
// ...inside <div className="flex items-center gap-[18px]">
<ThemeToggle />
```
Verify `ThemeToggle`'s `Button variant="ghost"` reads correctly on the landing in
both themes; if its colors are hardcoded, token them in Batch B.

- [ ] **Step 2: Commit**
```bash
git add src/components/landing/LandingNav.tsx
git commit -m "feat(theme): theme toggle in landing nav"
```

---

## Task 7: Final verification

- [ ] **Step 1: Post-sweep inventory diff**
```bash
grep -rEoh "#[0-9A-Fa-f]{3,6}|rgba?\([0-9, .]+\)" src --include="*.tsx" \
  | sort | uniq -c | sort -rn > /tmp/colors-after.txt
diff /tmp/colors-before.txt /tmp/colors-after.txt
```
Expected: remaining literals are only allowlist entries (Google logo, traffic
lights, syntax swatches, brand gradient stops, `rgba(0,0,0,*)` shadows).
Investigate any surface/fg/muted hex that survived.

- [ ] **Step 2: Build + lint**
```bash
npm run build
```
Expected: succeeds, ESLint clean.

- [ ] **Step 3: Visual check (both themes)** — load landing, login/register,
dashboard, templates, billing, api-keys, marketplace, a modal, the mobile menu.
Toggle each; confirm readable text, visible borders, no dark-on-dark or
light-on-light, no flash on reload. Spot-check dark mode is unchanged vs. `main`.

- [ ] **Step 4: Asset audit** — confirm `/og-image.png` and any in-app
screenshots/empty-state art don't break on light backgrounds. Note any that need
a transparent/light variant (follow-up, not blocking).

- [ ] **Step 5: Final commit**
```bash
git add -A && git commit -m "feat(theme): light theme complete across all surfaces"
```

---

## Self-review notes

- Spec coverage: tokens (T1), resolver+persistence+no-flash+themeColor+color-scheme
  (T2), un-hardcode shells (T3), allowlist+inventory guardrail (T4/T7), full sweep
  incl. landing (T5), landing toggle (T6), build/visual/asset verification (T7). ✓
- Dashboard header toggle already exists — not re-added; only landing needs one.
- Shadows kept separate from `ink` per Codex #6.
- HSL shadcn vars kept distinct from RGB tokens per Codex #4.
