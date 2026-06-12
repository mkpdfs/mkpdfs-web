# Light Theme — Design Spec

**Date:** 2026-06-12
**Repo:** mkpdfs-web
**Reference:** `mkpdfs-light.zip` → `design_handoff_mkpdfs_landing/mkpdfs Dashboard Light.dc.html` (light) vs `mkpdfs Dashboard.dc.html` (dark)

## Goal

The app currently ships dark-only: the dashboard and landing hardcode the `dark`
class plus literal hex colors (`bg-[#08080A] text-[#F4F4F6]`), and ~700 hardcoded
hex/`rgba` values across 33 files force a dark palette regardless of the theme
class. A `ThemeProvider` and `ThemeToggle` already exist but are wired in nowhere.

Add a **light theme** as a user-toggleable option across **all surfaces**
(dashboard, auth, landing), implemented as a **semantic-token refactor** so the
existing CSS-variable infrastructure actually drives the colors.

## Decisions (locked with user)

- **Toggleable**, system-preference aware. Resolution order: stored preference →
  system (`prefers-color-scheme`) → **default dark** when neither applies.
- **Scope:** everything — dashboard, auth pages, landing. No separate light
  landing reference exists; the landing light palette is derived from the
  dashboard light tokens.
- **Approach:** semantic tokens (CSS variables + named Tailwind utilities), not
  per-utility `dark:` overrides.
- **Landing toggle:** add to `LandingNav` (no toggle exists there today).
- **Execution:** one full migration pass, then build + verify.

## Key insight from the reference

The two reference mockups map cleanly:

- **Overlays/borders:** dark uses `rgba(255,255,255,α)`, light uses
  `rgba(10,10,30,α)` at *identical alphas* (0.09, 0.07, 0.05, 0.03, 0.025, 0.1, 0.12…).
  → Collapse into a single `--ink` base variable; `rgb(var(--ink) / α)` flips
  base RGB while keeping each alpha.
- **Accent overlays:** `rgba(124,92,255,α)` are **identical** in both themes →
  one `--accent-rgb` base, unchanged across themes.
- **Solid hexes:** 1:1 semantic mapping (color frequencies matched exactly
  between the two files, confirming role-equivalence).

## Theme resolution (single shared resolver) — addresses Codex blockers #1–3

There is **one** resolution function, used identically by the no-flash script and
`ThemeProvider`, so they can never disagree:

```
stored = localStorage('mkpdfs-theme')   // 'light' | 'dark' | 'system' | null
if stored === 'light' || stored === 'dark' → use it
if stored === 'system' || stored === null:
    if matchMedia available → 'dark' if prefers-color-scheme: dark else 'light'
    else → 'dark'            // default-dark fallback ONLY when media unavailable
```

- **No stored value === system mode.** We do NOT persist `'system'` separately;
  absence of a stored value *is* "follow the OS." The toggle is binary and writes
  an explicit `'light'`/`'dark'`, which from then on overrides the OS. This keeps
  the control simple while honoring "read system if available, default dark."
- `matchMedia(...).matches === false` means *system light*, not *no preference* —
  default-dark applies only when `matchMedia` is unavailable/throws (per Codex #2).
- `ThemeProvider` MUST read this resolver on init (not start at hardcoded
  `'light'`) and must not mutate `<html>` until it has, or it clobbers the head
  script on hydration (Codex #1).
- The no-flash `<script>` is the single authority that sets the `<html>` class
  before paint; the provider only re-applies on user action / OS change.

## Token system

Defined in `src/app/globals.css` as space-separated RGB triples on `:root`
(light) and `.dark` (dark). Registered as named utilities in
`tailwind.config.ts` using `rgb(var(--token) / <alpha-value>)`.

**Syntax rules (Codex #4, #7):**
- New tokens are **RGB triples** (`255 255 255`). Keep them in a separate block
  from the existing shadcn **HSL** vars (`--background: 0 0% 100%`) — never mix the
  two in one `rgb()`/`hsl()` call. Existing shadcn semantic utilities
  (`card`, `popover`, `border`, `input`, `ring`, `destructive`, `accent`) must be
  re-synced to the new palette too, not just `background`/`foreground` (Codex #11).
- In arbitrary values use slash-alpha: `rgb(var(--accent-rgb) / 0.13)` — the
  comma form `rgba(var(--accent-rgb), 0.13)` is INVALID with space triples.

**Shadows are NOT ink (Codex #6):** `rgba(0,0,0,α)` drop-shadows/modal scrims get a
separate `--shadow-rgb` (`0 0 0` both themes, lower alpha in light), distinct from
`--ink` strokes/overlays. Glass/glow panels reviewed case-by-case, not blind-swept.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--ink` | `255 255 255` | `10 10 30` | overlay/border base (`border-ink/[0.09]`) |
| `--accent-rgb` | `124 92 255` | `124 92 255` | accent overlays (unchanged) |
| `--surface` | `8 8 10` (#08080A) | `245 245 248` (#F5F5F8) | app background |
| `--surface-raised` | `12 12 15` (#0C0C0F) | `255 255 255` | sidebar / header / cards |
| `--surface-card` | `16 16 20` (#101014) | `248 248 251` (#F8F8FB) | elevated panels |
| `--text-primary` | `244 244 246` (#F4F4F6) | `22 22 26` (#16161A) | headings/body |
| `--text-secondary` | `156 156 168` (#9C9CA8) | `95 95 107` (#5F5F6B) | muted |
| `--text-tertiary` | `126 126 137` (#7E7E89) | `112 112 123` (#70707B) | dim labels |
| `--text-faint` | `92 92 102` (#5C5C66) | `154 154 162` (#9A9AA2) | faint/icons |
| `--accent` | `140 108 255` (#8C6CFF) | `140 108 255` | brand violet (same) |
| `--accent-text` | `183 166 255` (#B7A6FF) | `124 92 255` (#7C5CFF) | accent text on surface |
| `--accent-strong` | `201 187 255` (#C9BBFF) | `107 79 224` (#6B4FE0) | strong accent text |
| `--accent-deep` | `91 63 224` (#5B3FE0) | `91 63 224` | gradient end (same) |
| `--success` | `124 240 176` (#7CF0B0) | `31 138 91` (#1F8A5B) | success |
| `--danger` | `255 107 107` (#FF6B6B) | `201 47 77` (#C92F4D) | error |
| `--warning` | `254 188 46` (#FEBC2E) | `224 161 79` (#E0A14F) | warning |

Mapping for the remaining lower-frequency hexes (e.g. `#0e0e14`, `#0A0A0C`,
`#ECECF0`, `#A0A0AB`, `#6B6B76`, `#D6D6E0`, `#FF8A9B`, `#FFD479`, the macOS traffic
-light dots `#FF5F57`/`#FEBC2E`) is resolved during migration to the nearest
semantic token above; decorative one-offs (traffic lights, syntax-highlight
swatches) that read the same in both themes stay literal.

## Components changed

1. **`globals.css`** — add the variables to `:root` and `.dark`; keep the
   existing shadcn-style semantic vars in sync with the new palette so
   `bg-background`/`text-foreground` agree with `--surface`/`--text-primary`.
2. **`tailwind.config.ts`** — register the new named colors backed by the vars.
3. **`ThemeProvider.tsx`** — persist to `localStorage('mkpdfs-theme')`; SSR/no-
   pref fallback resolves to **dark** (not light). `toggleTheme` writes the
   resolved choice.
4. **`layout.tsx`** — inline no-flash `<script>` in `<head>`: read
   `localStorage('mkpdfs-theme')` → else `matchMedia` → else `dark`; set the
   class on `<html>` before paint.
5. **`DashboardLayoutClient.tsx`** — drop the hardcoded `dark` +
   `bg-[#08080A] text-[#F4F4F6]`; use `bg-surface text-text-primary`.
6. **`page.tsx` (landing) + landing components** — drop hardcoded `dark`; migrate
   to tokens; add `<ThemeToggle>` to `LandingNav`.
7. **`Header.tsx`** — mount `<ThemeToggle>`.
8. **Sweep all 33 files** under `src/app/[locale]/(dashboard)`, `src/components`,
   and `src/app/[locale]/(auth)` replacing hardcoded hex / `white/α` / `black/α`
   with the new tokens.
9. **Root browser theming (Codex #9):** set `color-scheme: dark` on `.dark` and
   `light` on `:root` (form controls / built-in scrollbars). Update Next
   `viewport.themeColor` to media-specific values (dark `#08080A` / light `#F5F5F8`).
10. **Interactive-state tokens (Codex #10):** focus ring, input placeholder,
    disabled, `::selection` (currently landing-only + accent), scrollbar
    track/thumb, table-row hover — give each a token/convention rather than
    leaving hardcoded rgba.

## Literal-color allowlist — colors that STAY hardcoded (Codex #8, #12)

The sweep must NOT tokenize content/brand/decorative colors. Reviewed allowlist:
- Google "G" logo SVG fills on the auth pages.
- macOS traffic-light dots (`#FF5F57` / `#FEBC2E` / `#28C840`) in terminal mockups.
- Syntax-highlight swatches in code/terminal examples.
- Brand gradient stops where intentionally theme-invariant (`#8C6CFF`→`#5B3FE0`).

**Guardrail for the one-pass sweep:** generate a hex/rgba inventory before AND
after; diff to confirm only intended values changed and every allowlist literal
survived. **Asset audit:** check `/og-image.png`, screenshots, template-preview
thumbnails, and empty-state art for baked-in dark backgrounds that break on light
(landing especially, since its light palette is derived not designed).

## Out of scope

- No redesign of layouts or components — colors only.
- No new dark palette; dark values preserve the current look exactly.
- Decorative literal colors that are intentionally theme-invariant stay literal.
- Stripe Checkout/Portal (external, separate styling) — only our return-state UI.

## Verification

- `npm run build` succeeds; ESLint clean.
- Manual toggle: dashboard, auth, landing each render correctly in both themes;
  no-flash on reload; system-preference respected with no stored choice;
  default dark when system pref unavailable.
- Spot-check that dark mode is visually unchanged from today (regression guard).
