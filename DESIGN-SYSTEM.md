# Design System — Lower the Curve

**Read this file before writing any font, font-size, colour, or button code.**
Everything listed here is already built. Reuse it. Do not rebuild it, do not add
a parallel version of it, and do not hardcode a value that already has a token.

## Pre-flight checklist (mandatory)

Run through this before touching typography, colour, or buttons:

1. **Read this file** and find the token or component that covers the request.
2. **Grep before adding anything new:**
   ```bash
   grep -rn -- "--fs-\|--color-\|font-family\|font-size" src/
   grep -rn "components/ui/Button" src/
   ```
3. **Does the request conflict with what exists?** (a new font, a size that
   isn't on the scale, a fifth button variant, a different breakpoint…)
   → **Stop and tell the user** which existing token/component it collides with,
   and offer either (a) using the existing one or (b) extending the system
   deliberately. Never silently add a one-off value next to the system.
4. **If it fits the system**, use the token. A component CSS Module should
   contain **zero** raw font-sizes, zero font-family declarations, and zero hex
   colours for brand blue.
5. **If you deliberately extend the system**, update this file in the same
   change. A token that exists in code but not here will get duplicated by the
   next dev.

## Where things live

| Concern | File | Notes |
|---|---|---|
| Font loading | [src/app/layout.js](src/app/layout.js) | Poppins via `next/font/google` |
| Type scale tokens | [src/app/typography.css](src/app/typography.css) | **single source of truth** for every font-size |
| Colour + layout tokens | [src/app/globals.css](src/app/globals.css) | brand blues, `--font-sans`, `--max-width`, `--space` |
| Button | [src/components/ui/Button/](src/components/ui/Button/) | `Button.js`, `Button.module.css`, `ArrowIcon.js` |

Import order in `layout.js` matters: `typography.css` **before** `globals.css`.

---

## 1. Font family

**Poppins is the only font on the site.** Weights loaded: **400, 500, 600, 700**
(Poppins is not a variable font, so each weight is a separate file — do not add
weights you aren't using).

- Loaded in [src/app/layout.js](src/app/layout.js) with `next/font/google`,
  exposed as `--font-poppins` on `<html>`.
- Consumed via `--font-sans: var(--font-poppins), sans-serif` in `globals.css`.
- Applied to **every element** through the `*, *::before, *::after` rule, plus an
  explicit rule for `button, input, select, textarea` (form controls never
  inherit typography from `body`).

### Rules
- **Never write `font-family` in a component.** It's already inherited.
- **Never add a second font family** (no display/serif/mono font) without asking
  the user first — it's a design-system-level decision, not a component detail.
- The only fallback is the generic `sans-serif`. Helvetica/Arial/system-ui were
  deliberately removed — do not add them back.

---

## 2. Type scale

Every font-size is a token. Each token is declared **three times** — once per
breakpoint tier — under the **same name**, so `font-size: var(--fs-heading-xl)`
is 64px on desktop, 52px on tablet and 40px on mobile with no media query in
your component.

### Breakpoint tiers

| Tier | Range | Where |
|---|---|---|
| Desktop | ≥ 1025px | `:root` |
| Tablet | 576–1024px | `@media (max-width: 1024px)` |
| Mobile | ≤ 575px | `@media (max-width: 575px)` |

Blocks are ordered desktop → tablet → mobile, all `max-width`, so the narrower
block overrides the wider one. **Keep that order.**

### Headings

| Token | Desktop | Tablet | Mobile | Use for |
|---|---|---|---|---|
| `--fs-heading-xl` | 64px | 52px | 40px | Hero / large page headline (one per page) |
| `--fs-heading-lg` | 48px | 40px | 32px | Major section headings |
| `--fs-heading-md` | 40px | 32px | 24px | Sub-section headings |
| `--fs-heading-sm` | 32px | 24px | 18px | Card titles, smallest heading |

### Paragraph / body

| Token | Desktop | Tablet | Mobile | Use for |
|---|---|---|---|---|
| `--fs-body-xl` | 24px | 20px | 16px | Lede / intro paragraph under a headline |
| `--fs-body-lg` | 22px | 18px | 16px | Emphasised body copy |
| `--fs-body-md` | 18px | 16px | 14px | Long-form body copy |
| `--fs-body-base` | 16px | 16px | 14px | **Default** body text, nav, buttons |
| `--fs-body-sm` | 14px | 14px | 12px | Captions, labels, legal, meta text |

### Element defaults
`h1`–`h4` and `p` already map to their token (`h1 → --fs-heading-xl`, …, `p →
--fs-body-base`). **Semantic markup needs no font-size CSS at all.** Only
override when the design genuinely differs from the element's default.

### Rules
- **No raw `px`/`rem` font-size in a component CSS Module. Ever.** Use a token.
- **No font-size media queries in components.** The tokens already respond.
- Naming asymmetry to be aware of: headings run `xl → lg → md → sm` (4 steps),
  body runs `xl → lg → md → base → sm` (5 steps). `--fs-heading-md` is the 3rd
  of 4; `--fs-body-md` is the 3rd of 5. Same suffix ≠ same position.
- Adding a token means adding it to **all three tier blocks**. A token defined
  in only one block silently breaks at the other two.
- A design asking for a size that isn't on the scale (e.g. 20px body on desktop)
  is a **conflict** — surface it to the user per the checklist above.

---

## 3. Colour tokens

Defined in [src/app/globals.css](src/app/globals.css):

| Token | Value | Use for |
|---|---|---|
| `--color-bg` | `#ffffff` | page background |
| `--color-text` | `#1a1a1a` | default text |
| `--color-ink` | `#010101` | near-black UI labels — header nav, hamburger bars |
| `--color-brand` | `#106cfd` | brand blue — primary actions, links, focus rings |
| `--color-brand-dark` | `#004bc9` | gradient start, hover states |
| `--color-brand-darker` | `#003a9e` | primary button hover gradient |
| `--color-brand-tint` | `#eef4ff` | light blue wash (secondary button hover) |

The brand gradient used across the design is
`linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`.

### Rules
- **No brand-blue hex codes in components.** Use the tokens.
- Neutral one-offs (e.g. a single muted body grey) are tolerated but should be
  promoted to a token the second time they're used.

---

## 4. Button

`src/components/ui/Button/` — **the only button in the codebase.** Do not write
a bespoke `<button>` with its own pill styling in a section component; import
this and pass props. If the design needs something this can't express, extend
this component rather than forking it.

```jsx
import Button from '@/components/ui/Button/Button';

<Button href="/services">Learn More</Button>
<Button href="/contact" arrow="diagonal">Book a Call</Button>
<Button variant="secondary" size="sm" onClick={fn}>Explore More</Button>
```

### Props

| Prop | Values | Default | Notes |
|---|---|---|---|
| `variant` | `primary` \| `secondary` \| `solid` | `primary` | `primary` = blue gradient fill, white label. `secondary` = white fill, blue label + 2px blue border. `solid` = **flat** fill, white label; both colours overridable per instance via the `--btn-bg` / `--btn-fg` custom properties. |
| `size` | `md` \| `sm` | `md` | `md` = 16px label (`--fs-body-base`), `sm` = 14px (`--fs-body-sm`). |
| `arrow` | `right` \| `diagonal` \| `none` | `right` | `right` = →, `diagonal` = ↗ (same SVG rotated -45°). |
| `href` | string | — | Present → renders a link. Absent → renders `<button>`. |
| `type` | button/submit/reset | `button` | Only used when rendering a `<button>`. |
| `className` | string | — | Merged after the internal classes, so it can override. |
| …rest | — | — | Spread onto the element (`onClick`, `aria-*`, `target`, …). |

### Behaviour worth knowing before you change it
- **Element choice is automatic:** `href` matching `^(https?:|mailto:|tel:|#)`
  renders a plain `<a>`; any other `href` renders a `next/link`; no `href`
  renders a `<button>`. Don't add an `as`/`component` prop — this covers it.
- **Arrow colour:** `secondary` uses the brand **gradient** stroke (blue arrow on
  white); `primary` uses `currentColor` (white arrow on blue). A gradient arrow
  on the blue fill would be invisible.
- **The diagonal arrow is not a second icon** — it's the same path rotated in
  CSS, which keeps stroke weight and cap style identical.
- **Padding is in `em`**, so it scales from the label size. Changing `size`
  changes the whole button, not just the text.
- Multiple gradient arrows on one page repeat the `<linearGradient>` id. Harmless
  (all definitions are identical) — don't "fix" it by making the component a
  Client Component just to call `useId`.
- Both variants carry a 2px border (transparent on `primary`) so the two are the
  same height side by side. Don't remove it.
- **`solid` exists for CMS-authored colours.** It's the one variant whose fill
  isn't a token: pass `style={{ '--btn-bg': hex, '--btn-fg': hex }}` and it uses
  them, falling back to `--color-brand` on white. Hover darkens via
  `filter: brightness()` rather than a second gradient, because the fill isn't
  known at author time. Use `primary` for any button whose colour is ours.

### Rules
- New visual treatment → **new `variant` in `Button.module.css`**, documented in
  the table above. Not a new component.
- Button labels use body tokens, so they shrink on mobile (16px → 14px). If a
  design needs a button locked to a fixed px size, that's a **conflict** — raise
  it with the user.

---

## 5. Open decisions

These were judgement calls made during the initial build. Confirm with the user
before relying on them as final:

- **Tablet sizes were interpolated**, not specified by design. Only desktop and
  mobile values came from the design.
- **`--fs-body-base` / `--fs-body-sm` don't shrink on tablet** (16px/14px body
  reads fine there); every other token does.
- **Mobile collapses the body scale from 5 steps to 3**: `xl`+`lg` → 16px,
  `md`+`base` → 14px, `sm` → 12px.
- **`PartnersSection` heading was snapped 24px → `--fs-heading-sm`** (32px
  desktop) because 24px isn't on the heading scale. Swap to `--fs-body-xl` if the
  original size was intended.
- **`HeroSection` title lost its fluid `clamp()`** in favour of the three-tier
  token, so it now steps rather than scaling continuously.
- The light ring around the blue buttons in the design was read as background
  separation, not a border. If it's real, `primary` needs a visible border colour.

### Header (added with the header build)
- **`--color-ink` (#010101) was added** rather than reusing `--color-text`
  (#1a1a1a). The design specified #010101 for nav labels. If the two were meant
  to be the same colour, delete `--color-ink` and point the header at
  `--color-text`.
- **Nav labels use `--fs-body-xl`** (24px desktop, per the design) — they drop to
  20px on tablet and 16px on mobile with the rest of the scale.
- **The CTA uses `Button variant="solid" size="md"`** — 16px per the design on
  desktop, 14px on mobile because `--fs-body-base` shrinks. If the design needs
  it locked at 16px everywhere, that's a conflict to resolve deliberately.
- **The nav collapses behind a hamburger at <= 1024px**, the existing tablet
  tier — no new breakpoint. Only desktop was specified, so the mobile panel's
  styling is a judgement call.
- **The header capsule is capped at 1200px, not `--max-width` (1152px).**
  Requested explicitly. `--max-width` was deliberately left alone, because every
  page section (hero, partners, footer, page `main`) uses it — changing the token
  would move all of them. Consequence: the capsule is 48px wider than the content
  below it, so its edges do not line up with the page. Resolve by either bumping
  `--max-width` to 1200px (moves every section) or accepting the header as
  intentionally wider.
- **Between 1025px and ~1168px the desktop row can overflow.** The 50px gap is
  fixed and the row's natural width (~1136px with the design's five labels) is
  close to the capsule's width, so viewports in that band are narrower than the
  row. Fixing it means either a smaller desktop gap or moving the collapse
  breakpoint — a 4th tier. Unresolved.
- **The mobile drawer's labels use `--fs-heading-md`** (24px mobile), overriding
  the inline nav's `--fs-body-xl` inside the `<= 1024px` block. 24px was specified
  directly. **Unresolved:** no token is 24px at *both* narrow tiers, so this
  renders 24px on mobile but **32px on tablet** (576-1024px). If 24px is meant to
  be flat across every width, that needs a new token declared at 24px in all
  three tier blocks — a deliberate scale addition, not a component one-off. The
  desktop nav is untouched at 24px via `--fs-body-xl`.
- **The CTA is hidden in the mobile drawer** (`display: none`), matching the
  reference, which shows no button. Deleting that rule restores it.
