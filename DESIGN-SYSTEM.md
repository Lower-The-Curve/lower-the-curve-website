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
| Colour + layout tokens | [src/app/globals.css](src/app/globals.css) | brand blues, `--color-accent-green`, `--font-sans`, `--max-width`, `--space`, `--header-height` |
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
| `--fs-body-base` | 18px | 16px | 16px | **Default** — `p` and `body`, long-form copy |
| `--fs-body-sm` | 16px | 16px | 14px | UI text: nav labels, button labels |
| `--fs-body-xs` | 14px | 14px | 12px | Captions, legal, meta text |

### Element defaults
`h1`–`h4` and `p` already map to their token (`h1 → --fs-heading-xl`, …, `p →
--fs-body-base`). **Semantic markup needs no font-size CSS at all.** Only
override when the design genuinely differs from the element's default.

`body` resolves to `--fs-body-base` too, so prose is 18px on desktop whether or
not it sits in a `<p>`.

**Inheritance trap — read this before sizing a text block from its wrapper.**
The global `p` rule matches paragraphs *directly*, and a directly-matching
declaration always beats an inherited one, regardless of the ancestor selector's
specificity. So this does **not** work:

```css
.legal   { font-size: var(--fs-body-xs); }  /* never reaches the <p> */
.legal p { margin: 0; }                     /* p keeps --fs-body-base = 18px */
```

To size prose smaller (or larger) than the default, put the token on the
paragraph itself: `.legal p { font-size: var(--fs-body-xs); }`. This bit
`Footer.module.css` — its copyright line silently rendered at the `p` default
instead of its intended 14px.

### Rules
- **No raw `px`/`rem` font-size in a component CSS Module. Ever.** Use a token.
- **No font-size media queries in components.** The tokens already respond.
- Naming asymmetry to be aware of: headings run `xl → lg → md → sm` (4 steps),
  body runs `xl → lg → base → sm → xs` (5 steps). **There is no `--fs-body-md`
  and no `--fs-heading-base`/`--fs-heading-xs`** — the two scales share only
  `xl`, `lg` and `sm`, and `--fs-heading-sm` (3rd of 4) sits at a different
  position than `--fs-body-sm` (4th of 5). Same suffix ≠ same position.
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
| `--color-accent-green` | `#3ba952` | secondary accent — the green half of the brand pair |
| `--color-accent-green-dark` | `#2a773a` | dark end of the green gradient |

The brand gradient used across the design is
`linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`, and the
green accent mirrors it:
`linear-gradient(135deg, var(--color-accent-green-dark), var(--color-accent-green))`.

**At 135deg the first stop is the top-left end**, so that stop order puts the
dark blue on the *left*. The hero headline's blue accent deliberately reverses
the stops to put the darker blue on the **right** — see the Hero notes in §6.
Everything else (buttons, arrows) keeps the dark-on-left order above.

### Rules
- **No brand-blue hex codes in components.** Use the tokens.
- Neutral one-offs (e.g. a single muted body grey) are tolerated but should be
  promoted to a token the second time they're used.
- **`--color-accent-green` is display-text only.** It clears 3:1 on white (the
  WCAG large-text floor), not 4.5:1. `--color-brand` sits at 4.58:1, so the two
  accents are *not* interchangeable — don't put the green on body copy, labels or
  small UI text. If green is ever needed at body size, that's a second token
  (a darker `--color-accent-green-dark`), not a reuse of this one.

### Where the green came from (confirm before relying on it)
The design has no specified green hex — it was **derived**, and the value is a
judgement call. The hero's background artwork
(`Landing_page_sector.png`) contains a green gradient running from `#298c6d`
through `#5cc371` to a near-white `#e0fbdd`. None of those work as text on
white: the light end is ~2.2:1 and even the deep end only reaches 4.15:1 while
reading teal rather than the grass green in the reference. So
`--color-accent-green` takes the artwork's **hue** (132°) at a raised saturation
and darkens it to land exactly on 3:1 — mirroring how `--color-brand` (#106cfd)
is the same artwork's saturated blue at 4.58:1.
`--color-accent-green-dark` is the same hue and saturation taken down to 5.5:1,
so the gradient between them is visibly a gradient while its *lightest* pixel
still clears the 3:1 floor.

**If design has a real green swatch, replace both values** — every consumer
reads the variables, so it's a two-line change in `globals.css`.

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
| `size` | `md` \| `sm` | `md` | `md` = 16px label (`--fs-body-sm`), `sm` = 14px (`--fs-body-xs`). |
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

## 5. Layout tokens

Also in [src/app/globals.css](src/app/globals.css):

| Token | Value | Use for |
|---|---|---|
| `--max-width` | `72rem` (1152px) | the content measure every section applies itself |
| `--space` | `1rem` | the standard gutter |
| `--header-height` | `104px` / `93px` ≤575px | the header's rendered height |

### `--max-width` lives on the section, not on `main`
**Every section owns its own measure** — `max-width: var(--max-width); margin: 0
auto` plus `--space` gutters — and a page's `main` adds neither a max-width nor
padding. That's deliberate: it's the only way a **full-bleed** section (the
hero's background artwork) can reach the viewport edges, and it keeps one
section's spacing from being decided in the page's CSS.

So: a new section is responsible for its own width and vertical rhythm. Don't
"fix" a too-wide section by constraining `main`; that caps every sibling,
full-bleed ones included.

### `--header-height`
The header is **transparent and in normal flow**, so a section that wants
artwork behind the nav offsets its own background layer upward by this token
rather than the page pulling the header out of flow:

```css
.backdrop { position: absolute; top: calc(-1 * var(--header-height)); inset: 0 0 0 0; z-index: -1; }
```

The token is **authoritative, not documentary**: `Header.module.css` sets
`.capsule`'s `min-height` from it, so the header can't silently drift away from
the number sections are offsetting by. It resolves to the header's two real
heights — 104px, and 93px at ≤575px where the logo box shrinks.

Prefer this over a negative `margin-top` on the section: offsetting only the
background layer leaves the section's own box in flow, so nothing above or below
it moves.

---

## 6. Open decisions

These were judgement calls made during the initial build. Confirm with the user
before relying on them as final:

- **Tablet sizes were interpolated**, not specified by design. Only desktop and
  mobile values came from the design.
- **`--fs-body-sm` / `--fs-body-xs` don't shrink on tablet** (16px/14px body
  reads fine there); every other token does.
- **The body scale was renamed so `base` means the default paragraph size.**
  `md`(18px) → `base`, old `base`(16px) → `sm`, old `sm`(14px) → `xs`. Values
  were **not** touched by the rename itself — it was behaviour-preserving, and
  every consumer was updated in the same change. Net visual effect of the whole
  18px request: paragraphs went **16px → 18px on desktop and 14px → 16px on
  mobile**; tablet stayed at 16px.
- **`--fs-body-base` was raised to 16px on mobile** (from the 14px it inherited
  as the old `md`). Requested explicitly. It's the only token whose mobile value
  was changed, so `sm` (14px) and `xs` (12px) still sit below it and the scale
  stays monotonic at every tier — but see the 5-steps-to-3 note above for the
  lede/body collision this creates on mobile.
- **`body` was repointed from the 16px token to `--fs-body-base` (18px)** so it
  agrees with `p`. Only one thing in the codebase actually inherits its size from
  `body` — the `<span>{name}</span>` logo-less fallback in `PartnersSection` — so
  this moved that span 16px → 18px and nothing else. Every other text node is
  either explicitly sized or an `h1`–`h4`/`p`.
- **`Button`'s `size` prop names no longer match the token names.** `size="md"`
  reads `--fs-body-sm` and `size="sm"` reads `--fs-body-xs`. The sizes rendered
  are unchanged (16px / 14px) and the prop is a public-ish API, so it was left
  alone. Renaming the props to `sm`/`xs` would realign them — a deliberate API
  change, not a token one.
- **Mobile collapses the body scale from 5 steps to 3**: `xl`+`lg`+`base` →
  16px, `sm` → 14px, `xs` → 12px. Because `xl`, `lg` and `base` are all 16px
  there, **a lede and default body copy are indistinguishable by size on
  mobile** — separate them with weight or colour, or give `--fs-body-xl` its
  own mobile value (a deliberate scale change).
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
- **Nav labels use `--fs-body-base`** (18px desktop). They were `--fs-body-xl`
  (24px, per the original design) until this was changed on request. Only the
  desktop tier is affected: the `<= 1024px` block overrides `.link` with
  `--fs-heading-md` for the drawer, so narrow widths are untouched.
- **The CTA uses `Button variant="solid" size="md"`** — 16px per the design on
  desktop, 14px on mobile because `--fs-body-sm` shrinks. If the design needs
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
- **The 1025–~1168px desktop overflow is largely relieved** by the nav dropping
  to 18px. The 50px gaps are still fixed, but the label text is ~25% narrower, so
  the row's natural width fell well below the capsule's. Worth re-measuring in a
  browser at ~1030px before calling it closed — if it still overflows, the fix is
  a smaller desktop gap or a 4th tier, as before.
- **The mobile drawer's labels use `--fs-heading-md`** (24px mobile), overriding
  the inline nav's `--fs-body-xl` inside the `<= 1024px` block. 24px was specified
  directly. **Unresolved:** no token is 24px at *both* narrow tiers, so this
  renders 24px on mobile but **32px on tablet** (576-1024px). If 24px is meant to
  be flat across every width, that needs a new token declared at 24px in all
  three tier blocks — a deliberate scale addition, not a component one-off. The
  desktop nav is untouched at 24px via `--fs-body-xl`.
- **The CTA is hidden in the mobile drawer** (`display: none`), matching the
  reference, which shows no button. Deleting that rule restores it.
- **The logo is 81x33 with 18px vertical padding below 575px** (123x50 / 15px
  above it), making the header row **69px** tall on phones against 80px on
  desktop and tablet. Only the 81px width was specified; 33px is derived to hold
  the desktop box's 2.46 ratio (81 / 2.46 = 32.9), which is what lets
  `object-fit: contain` fill the box rather than letterbox. Note this is
  the **first `<= 575px` block in `Header.module.css`** — the header previously
  had a single `<= 1024px` block, so tablet keeps the desktop logo figures. If
  "mobile" was meant to cover the whole collapsed range, move these two rules up
  into the `<= 1024px` block instead.

### Hero (added with the hero build)
- **`--color-accent-green` (#3ba952) was added** — the design's green headline
  word had no token and no specified hex. See "Where the green came from" in
  §3; **confirm the value with design**, and note it's a 3:1 (large-text-only)
  colour, unlike every other accent here.
- **The headline's accent runs are authored, not hardcoded.** The `title` field
  carries HTML spans, and the class name selects the accent:
  `Let’s Launch a <span class="green-gradient">Shopify Store</span> with
  <span class="blue-gradient">us</span>`. The alternative (matching the words
  "Shopify" and "us" in code) would have hidden editorial copy in the component
  — as it happens the live copy greens *both* words, which a hardcoded match
  would have got wrong.
  - **The title is parsed, never injected.** No `dangerouslySetInnerHTML`: only
    `<span>` with a class in `ACCENT_CLASSES` becomes an element, so pasted
    markup can't execute. Adding a third accent means adding a class to that map
    — a `<span>` whose class isn't in it keeps its words and loses the styling.
  - A title with no spans renders as plain text, so an un-marked title is not an
    error — it just renders all in `--color-text`.
- **The headline is regular weight (400); only the accent runs are bold (700).**
  Requested explicitly, and it's the one heading on the site that isn't bold —
  `PartnersSection`, the footer brand and the header all use 700. The weight sits
  on `.accent`, not on `.green`/`.blue`, so "the accented words are the bold
  ones" is stated once. Note this makes the headline **lighter than the
  reference screenshot**, where the whole line reads bold.
- **The accents are gradient-filled, not flat**, because the authored class names
  say `-gradient`: the brand gradient is painted as a background and clipped to
  the glyphs. It's wrapped in an `@supports` test for `background-clip: text`
  **and** `-webkit-text-fill-color`, because with only the first the
  `color: transparent` would render invisible words. Flat colours are declared
  outside the guard, so **deleting the whole `@supports` block reverts to flat
  colour** with nothing else to change.
- **The blue accent's stops are reversed relative to the brand gradient**, so its
  darker blue lands on the **right** of the word (requested). Same two colours,
  same 135deg diagonal — only the stop order differs, because at 135deg the first
  stop is the top-left end. **The green accent was left dark-on-left**, so the two
  accents currently run in opposite directions; flip green's stops to match if
  that was meant to apply to both.
- **`--header-height` was added** and `main` stopped applying `--max-width` /
  padding, so the hero's artwork can be full-bleed and start at the top of the
  page. See §5 — this changed **every** page's `main`, so sections now own all
  the spacing that `main`'s `padding: 4rem var(--space)` used to supply. The home
  page's partners section and the services page therefore sit tighter to their
  neighbours than before; add the rhythm back **on the section** if that reads
  too tight.
- **The three-line headline break comes from `max-width: 13ch`** on `.title`,
  not from authored line breaks (`title` is a `single_line_text_field`, so it
  can't hold any). `ch` scales with `--fs-heading-xl`, which is what keeps the
  same break at 64/52/40px. A materially longer headline will break elsewhere —
  that's a measure, not a guarantee. Same technique on `.scrollText` (`14ch`).
- **`--fs-body-xl` for the description** (24px desktop), per the token's stated
  "lede under a headline" role. The live entry has **no description authored**
  (the field is null, so nothing renders), which matches the reference design —
  meaning this size is inferred and has never been seen against real copy.
- **The scroll cue is not interactive.** The metaobject gives it text but no link
  or target, and making it scroll would force the section to a Client Component.
  If it should jump to the next section, that's a deliberate change.
- **The cue's double chevron is drawn in `ChevronsDownIcon.js`**, not authored in
  Shopify — there's no icon field. Two chevrons was read off the reference; if
  it's meant to be three, that file is the only place to change.
- **`content_align` defaults to centre** when the field is empty (the services
  hero leaves it unset). It's free text in the admin — the live value is
  `"Center "`, with a trailing space — so it's trimmed and lowercased before
  lookup, and an unrecognised value falls back to centre rather than breaking.
- **`margin_top` / `margin_bottom` apply as plain `px` margins** on the section
  via custom properties. Both are `0` on the live entry, so this is untested
  against a non-zero value; note a positive `margin_top` will open a white band
  above the artwork, since only the artwork layer is offset up under the header.
- **The artwork is `cover`, anchored `center top`.** On a portrait phone a 16:9
  wash gets cropped hard — only its top-left corner shows. Acceptable for a soft
  gradient with no detail to protect; a separate mobile crop would need a second
  image field.
