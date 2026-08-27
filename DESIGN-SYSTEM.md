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
| `--fs-heading-md` | 40px | 32px | **32px** | Sub-section headings |
| `--fs-heading-sm` | 32px | 24px | 24px | Card titles, smallest heading |

### Paragraph / body

| Token | Desktop | Tablet | Mobile | Use for |
|---|---|---|---|---|
| `--fs-body-xl` | 24px | 20px | **18px** | Lede / intro paragraph under a headline |
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

### The footer pair — the one place the scale runs backwards

| Token | Desktop | Tablet | Mobile | Use for |
|---|---|---|---|---|
| `--fs-footer-heading` | 18px | 24px | 24px | footer column headings |
| `--fs-footer-link` | 14px | 18px | 18px | footer links |

These **get bigger as the viewport narrows** — the opposite of every token
above. The footer stops being a compact three-column strip and becomes the
primary stacked navigation on a phone, and the design sizes it for thumbs.

They are separate tokens rather than points on the scale because **no scale
token can express an inverted pair**: 18px desktop is `--fs-body-base`, but that
is 16px on mobile, not 24px; 14px desktop is `--fs-body-xs`, but that is 12px on
mobile, not 18px. Forcing it would have meant a font-size media query inside
`Footer.module.css`, which rule 2 below forbids.

Only desktop and mobile were specified. **Tablet takes the mobile values**,
because that is where the stacked layout begins (≤ 1024px, reusing the header's
existing collapse point rather than inventing a breakpoint). If the footer should
keep three columns on a tablet, that tier needs its own pair — and a fourth
breakpoint.

Don't reach for these outside the footer. Another component needing type that
grows on mobile is a second inverted pair and its own decision.

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
| `--color-text-muted` | `#4a4a4a` | muted body copy — a lede under a headline, supporting card copy |
| `--color-brand` | `#106cfd` | brand blue — primary actions, links, focus rings |
| `--color-brand-dark` | `#004bc9` | gradient start, hover states |
| `--color-brand-darker` | `#003a9e` | primary button hover gradient |
| `--color-brand-tint` | `#eef4ff` | light blue wash — **currently unused**, see the `secondary` hover note in §4 |
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
  promoted to a token the second time they're used. `--color-text-muted` is that
  promotion: the hero lede's `#4a4a4a` became a token when `SolutionsSection`
  needed the same grey. It clears 8.6:1 on white, so unlike the green accent it
  is safe at any size.
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
| `variant` | `primary` \| `secondary` \| `solid` | `primary` | `primary` = blue gradient fill, white label. `secondary` = white fill, blue label + 2px blue border, **inverting to a solid brand fill on hover**. `solid` = **flat** fill, white label; both colours overridable per instance via the `--btn-bg` / `--btn-fg` custom properties. |
| `size` | `md` \| `sm` | `md` | `md` = 16px label (`--fs-body-sm`), `sm` = 14px (`--fs-body-xs`). |
| `arrow` | `right` \| `diagonal` \| `rise` \| `none` | `right` | `right` = →, `diagonal` = ↗ (same SVG rotated -45°), `rise` = → at rest swinging up to ↗ on hover. |
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
- **`secondary`'s hover inverts to the brand fill** — blue background, white
  label, white arrow — rather than the `--color-brand-tint` wash it used to have.
  That wash was `#ffffff` to `#eef4ff`, a ~3% luminance step that read as no
  hover at all, especially on `SolutionsSection`'s frosted white cards. It was
  confirmed in-browser (CDP, computed styles before/after a real pointer move)
  that the old rule *did* fire — it simply wasn't visible. `--color-brand-tint`
  now has no consumer.
- **The white arrow on that hover is a CSS `stroke` on the path**, not a
  recolouring of the gradient's stops. CSS `stroke` beats the SVG's
  `stroke="url(#…)"` presentation attribute, so it repaints the hovered button's
  arrow only. Recolouring the stops would NOT work: every arrow on the page ships
  the same `ltcArrowGradient` id, so `url(#…)` resolves to the **first**
  definition in the document and hovering one button would repaint every arrow on
  the page. Verified — with three other buttons present, only the hovered one's
  stroke changes. **This is the duplicate-id caveat below turning from harmless
  into load-bearing: keep per-button state out of the gradient definition.**
- **The diagonal arrow is not a second icon** — it's the same path rotated in
  CSS, which keeps stroke weight and cap style identical. `rise` is the same
  trick again: no rotation at rest, `rotate(-45deg)` on hover, eased by the
  transition the arrow already had.
- **`rise` is its own arrow value, not a change to `right`'s hover.** The header
  CTA uses the default `right` and should keep pointing where it points, so the
  rise behaviour had to be opt-in. Its nudge is composed *after* the rotation
  (`rotate(-45deg) translateX(3px)`), so the arrow travels up-and-right along its
  new axis rather than sideways.
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
| `--max-width` | `78rem` (1248px) | the content measure every section applies itself |
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
- ~~**Mobile collapses the body scale from 5 steps to 3**~~ **RESOLVED — it is 4
  now.** `--fs-body-xl` was given its own mobile value (16px → **18px**) when the
  solutions cards' titles were specified at 18px on a phone. So mobile runs
  `xl` 18 / `lg`+`base` 16 / `sm` 14 / `xs` 12, and a lede is once again
  distinguishable from body copy by size. **The hero's lede reads the same token,
  so it moved 16px → 18px on mobile too.**
- ~~**`PartnersSection` heading was snapped 24px → `--fs-heading-sm`**~~
  **CONFIRMED.** `--fs-heading-sm` is the intended desktop size (32px).
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
- ~~**The header capsule is capped at 1200px, not `--max-width` (1152px).**~~
  **RESOLVED.** `--max-width` is now `78rem` (1248px) site-wide and the header
  capsule reads that token instead of a hardcoded 1200px, so the header, every
  section and the footer share one edge. This moved every section 96px wider —
  intended, and the reason the change was made in one place rather than per
  component.
- **The 1025–~1168px desktop overflow is largely relieved** by the nav dropping
  to 18px. The 50px gaps are still fixed, but the label text is ~25% narrower, so
  the row's natural width fell well below the capsule's. Worth re-measuring in a
  browser at ~1030px before calling it closed — if it still overflows, the fix is
  a smaller desktop gap or a 4th tier, as before.
- ~~**The mobile drawer's labels use `--fs-heading-md`** … renders 24px on mobile
  but 32px on tablet~~ **RESOLVED.** They now read **`--fs-heading-sm`**, which is
  24px at *both* narrow tiers, so the drawer is a flat 24px across the whole
  collapsed range. This fell out of raising `--fs-heading-md`'s mobile value to
  32px for the solutions heading — the drawer had to move off that token anyway,
  and `--fs-heading-sm` was already the size it wanted. No new token was needed.
  The desktop nav is untouched.
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


### Type scale changes made for the solutions section
- **`--fs-heading-md` mobile: 24px → 32px.** The section heading is specified at
  40px desktop / 32px mobile and no existing token spans that pair. Raising it
  also **un-collapsed the two smallest heading steps** — `md` and `sm` were both
  24px on mobile and are now 32px and 24px.
  - Knock-on: the header's mobile drawer read this token for its spec'd 24px, so
    it was repointed at `--fs-heading-sm` — see the resolved note below.
  - Knock-on: `.statValue` shares the token with the section heading (both are
    40px on desktop), so **the stats numbers went 24px → 32px on mobile**.
- **`--fs-body-xl` mobile: 16px → 18px.** The solution card titles are specified
  at 18px on a phone, and no mobile token was 18px — `xl`, `lg` and `base` all
  sat at 16px. Knock-on: **the hero's lede moved 16px → 18px on mobile**, as it
  reads the same token.
- Nothing on desktop or tablet moved: the section heading is still 40/32, the
  card titles 24/20, and every paragraph 18/16.

### Case Studies (added with the case-studies build)
- **The live `case_studies` entry** sits in home's Component 4 with `title`,
  `description`, `image` and `button`.
- **`button` is typed `url`, not `link` — and that carries NO label.** This is
  worth knowing because it silently broke the button: a `link` field's value is
  JSON (`{"text":…,"url":…}`) and a `url` field's is a bare string, so
  `JSON.parse` threw and the button was dropped with no error anywhere.
  `linkFrom()` now accepts both shapes.
  - Because a `url` has no text, the label falls back to a `BUTTON_TEXT` constant
    in the component. **Authoring a `button_text` field, or retyping `button` to
    `link`, takes over with no code change** — do that and delete the constant,
    since copy belongs in the CMS.
- **Paragraphs come from blank lines** in the one `description` field, so an
  editor adds or removes one by pressing return twice. Single line breaks inside
  a paragraph survive via `white-space: pre-line`.
- **Two things in the live data worth fixing** (neither is a code problem): the
  button URL reads `lowerthecruve.com` — **"cruve", a typo** — and the image has
  no alt text, so it renders `alt=""`. A real alt would be better for anything
  that carries meaning.
- **It adds no tokens.** Both specified sizes were already on the scale:
  40px/32px is `--fs-heading-md` (40/32/32 — the pair the solutions build had just
  produced) and 18px/16px is the `p` default `--fs-body-base` (18/16/16), so the
  paragraphs carry no font-size at all.
- **`.title`'s 21ch is measured.** The reference breaks it "Case Studies that
  speak / for themselves", which needs a measure that fits "Case Studies that
  speak" (**490px**, with "Case Studies" bold) but not "…that speak for"
  (**555px**); 21ch is 525px, inside that window with room either side. On a phone
  the column is narrower than any of it (358px at 390px wide) and caps the measure
  itself, producing the narrow reference's break with no override — which is why
  there is no `.title` rule in the media queries.
- **Three paragraphs, one field.** `description` is split on blank lines, so an
  editor adds or removes a paragraph by pressing return twice. Single line breaks
  inside a paragraph survive via `white-space: pre-line`.
- **The image is first in the DOM**, so it stacks above the copy when the grid
  collapses — the narrow reference's order, with no `order` property.
- **`.hasMedia` gates the two-column split.** The default is one column, so an
  entry with no image doesn't leave an empty grid cell and half the measure unused.
- **The decorative green blobs are not built.** The reference has a small blurred
  green dot top-left and a large green wash top-right; no assets were supplied.
- **The title parser moved to `src/components/ui/accentedTitle.js`** in this
  change and is now shared with `SolutionsSection` (verified: Solutions' rendered
  heading markup is byte-identical before and after). `HeroSection` and
  `PartnersSection` still carry their own older, narrower copies — fold them in if
  either grows a second accent.

### Testimonials (added with the testimonials build)
- **THE LIVE API IDENTIFIERS ARE MISSPELLED, and that is the real key.** The
  section type is **`testimonails`** (the "ai" transposed) and its items are
  **`teestimonial`** (doubled e). Shopify fixes an API identifier at creation and
  does NOT rename it when the display name is corrected, so the typo is what the
  code must match. This is why the section rendered nothing at first: the type
  string was right by spelling and wrong by fact.
  - `page.js` dispatches on **both** spellings (`TESTIMONIALS_TYPE` and
    `TESTIMONIALS_TYPE_CORRECTED`), so recreating the definition correctly cannot
    silently blank the section out.
  - The item type never has to be matched — the cards are read through the
    reference list, not by type — so `teestimonial` needs no handling.
- **The live shape, as authored:**

  | type | field | holds |
  |---|---|---|
  | `testimonails` | `title` | heading |
  | | `description` | the lede |
  | | `testimonial` | list.metaobject_reference -> the cards |
  | `teestimonial` | `description` | **the quotation** — not `quote` |
  | | `name` | e.g. "Rron Zogiani" |
  | | `company` | e.g. "CEO" |

  The readers accept `quote` / `text` / `description` for the quotation, so the
  live naming works as-is.
- **One thing is still missing from the content:** the title carries **no accent
  markup**, so "love" and "us" are not blue. Paste this as the title:
  `Why they <span class="blue-gradient">love</span> working with <span class="blue-gradient">us</span>`
- **The card's overhang offset lives on `.logoBox`, not `.author`.** On `.author`
  it shifted the whole row, so a testimonial with no logo — which is every one of
  them today — dragged the NAME out past the card's left edge and clipped it.
  Putting it on the plate means the row is unaffected when there is no plate.
- **It adds no tokens.** Every specified size was already on the scale: heading
  `--fs-heading-md` (40), lede the `p` default `--fs-body-base` (18), quote
  `--fs-body-lg` (22), name and company `--fs-body-base` (18). The name is
  separated from the company by weight and colour, not size, because the design
  gives both 18px.
- **The site's second Client Component**, after `HeaderNav`'s mobile drawer — and
  the first *section* that is one. The carousel needs state and a scroll listener,
  which is the one case the conventions allow `'use client'` for.
  - Because of that the **type constant and the GraphQL fragment live in
    `testimonials.shared.js`**, not in the component: the page query imports the
    fragment, and a server-side query module must not pull a client module into
    its graph. `TestimonialsSection.js` is a two-line barrel that re-exports both
    sides, so the page still imports from one path like every other section.
  - The carousel is a **native scroll container with CSS scroll-snap**, not a
    JS-driven slider — it works by swipe, trackpad, keyboard and screen reader
    before any of the JS runs. The arrows and the progress bar are enhancements
    on top of it, and both are hidden outright when everything already fits.
  - The arrow step is **read off the DOM** (first card's width + the computed
    `column-gap`) rather than hardcoded, so it stays in step with whatever the CSS
    is doing at that breakpoint. Verified: 520px = 496 card + 24 gap, exactly.
  - `--card-width` and `--card-gap` are declared on `.inner` because the JS reads
    the gap from there — one element owns both, so the JS and the CSS cannot
    disagree about how far a step is.
- **`.testimonials` is `overflow-x: clip`, and it fixes a real bug.** The track's
  right-hand bleed is a negative margin built from `100vw` — and **100vw includes
  the scrollbar while the layout width does not**. With a real scrollbar present
  the track ran **8px past the page** and gave the whole document a horizontal
  scroll, measured at both 1440 and 1920. Every earlier sweep used
  `--hide-scrollbars`, which is exactly why it was missed: **test overflow with
  scrollbars ON.**
  - **`clip`, not `hidden`.** Verified in-browser: `overflow-x: hidden` computes
    `overflow-y` to **`auto`**, making the section a vertical scroll container as
    a side effect; `clip` leaves it `visible`. Both remove the 8px, and the
    carousel still scrolls either way — `clip` just has no second effect. Same
    reasoning as `.solutions`.
  - Re-verified at 10 widths from 320 to 2560 with scrollbars on: zero horizontal
    overflow, carousel scrollable, both arrows present at every width.
- **Responsiveness was swept at 14 widths** (320-1920) and three real faults came
  out of it. All three were found by measuring, not by looking:
  - **`--card-width` was uncapped on mobile** (`100vw - 3.5rem`), so at 575px the
    card was **519x290** — far wider and flatter than the design's 525x350, with
    the notch stretched into a 190x58 slot — and it jumped 519 -> 416 across the
    575/576 boundary. Now `min(calc(100vw - 3.5rem), 26rem)`: it grows with the
    viewport and then stops at the tablet width, so the two tiers meet.
  - **The closing quote mark was a flex child of the author row**, taking ~50px
    out of it. On a 320-360px phone that squeezed the name box to 73-99px and
    "Rron Zogiani" wrapped onto two lines. It is now out of flow, pinned to the
    card's bottom-right — decoration should not take width from content.
  - **Taking it out of flow then let it sit ON the name**, since nothing reserved
    its space. `.author`'s `padding-right` now includes the mark's width plus a
    gap, at both tiers.
  - Verified across all 14 widths: no page overflow, no clipped quote, no wrapped
    name, no overlap. Card aspect now runs 0.64-1.33 against the design's 1.5,
    instead of 0.61-1.79.
  - **320px is the floor, and it is tight.** The name fits with ~3px to spare, so
    a noticeably longer name than "Rron Zogiani" will wrap there. If that matters,
    the fix is a narrower notch on mobile — which means a second clip path, since
    the 36.667% is baked into the path itself.
- **The track bleeds to the viewport's right edge** so the next card is cut by the
  page edge, as the reference shows, rather than by the grid column. Same walk-out
  `calc` as the solutions swoosh: half the leftover width plus the gutter.
- **THE CARD IS A NOTCHED SHAPE, NOT A ROUNDED RECTANGLE.** Design's SVG is a
  525x350 rounded rect (23.78px corners) with a **bite cut out of the bottom
  left** — 36.667% of the width by **20%** of the height. That bite is the seat the
  logo plate sits in; the plate does not overlap the card, it fills the cut.
  - **The notch is 20% tall, not the design frame's 25%.** On a 525x350 frame
    those are the same 87.5px, but the real card is taller than 350 — 442px at
    1440 — and a fraction of a taller card is a taller notch. 25% came out at
    **110px** and visibly squeezed the quote above it. 20% lands at **88px**, the
    design's absolute size, leaving 24px of clearance under the last line. It
    cannot be pinned in pixels: an objectBoundingBox clip only speaks in
    fractions, which is the trade for a card whose height follows its content.
  - **The notch's height fraction lives in THREE places** and they must move
    together: the clip path's y values, `NOTCH_HEIGHT`, and `.logoBox`'s `height`.
    The first two are in `CardShape.js`. A mismatch shows as a gap or an overlap
    between the plate and the bite.
  - **`clip-path: path(...)` — design's own CSS — CANNOT BE USED, and the reason
    is worth remembering.** `path()` takes ABSOLUTE user units, so it pins the
    card to exactly 525x350 and clips away anything past those coordinates rather
    than letting the box grow. Measured with the real copy: a six-line quote
    overflowed the 350px box by **27px** and lost its last line, and a 525px card
    is wider than a 390px phone. A card whose height comes from its content has to
    clip against an SVG `clipPath` in **objectBoundingBox units** — the same
    outline as fractions of whatever box the card ends up being.
  - The one cost of that: each axis scales independently, so the corner arcs go
    slightly elliptical when the card is not 525:350. At the real 496x442 it is a
    couple of pixels on a 23.78px radius.
  - **The element is clipped, not painted behind.** That is what makes the notch
    cut the card's background AND its `backdrop-filter`, rather than leaving a
    rectangle of frosted white showing through the bite.
  - **The logo plate is a SIBLING of the clipped card, not a child.** `clip-path`
    clips descendants, so a plate inside the card was cut away by the very notch it
    fills — and took the name beside it with it. `.cardWrap` is the positioning
    context; the plate is absolutely placed at `36.667% x 25%`, the same two
    fractions the clip path is built from, so plate and bite cannot drift.
  - **The edge is a 6px stroke, half-clipped, so it renders as 3px.** `CardShape`
    strokes the same outline with `vector-effect="non-scaling-stroke"`; the card's
    clip eats the outer half, so **the rendered edge is always half `strokeWidth`**
    — that is the number to change. The export's mask trick produced 1px; the
    thickening is deliberate. Verified at 1:1: exactly 3 CSS px.
  - **The gradient runs WHITE to grey, left to right**, so the left-hand end of the
    edge is white on a white page and stays invisible however thick it is.
    Thickening only shows on the right and along the bottom. That is the export's
    own gradient, not a bug — if the edge needs to read all the way round, the
    white stop is the thing to change.
  - **`.notched .author`'s `padding-left` carries a `+1.8333rem` correction, and
    it is not a fudge.** Percentage padding resolves against the CONTAINING
    BLOCK's width — the card's content box, i.e. the card minus its 2.5rem of
    padding either side — not against the element's own. A bare `36.667%` lands
    short of the notch by `36.667% x 5rem`. Adding it back makes the total exactly
    36.667% of the CARD. Verified: name at 202px against a 182px notch on desktop,
    138 against 122 on mobile.
  - **The plate is `position: absolute` at the card's bottom-left**, filling the
    notch — verified at offset `left: 0, bottom: 0`, 182x88 on desktop and 122x72
    on mobile, with the logo scaled to fit inside it.
  - **The live field is `company_logo`, not `logo`.** The reader takes
    `company_logo` first, then `logo` / `image` as fallbacks. Worth knowing: while
    the key did not match, the plate rendered nothing and every card showed an
    empty bite out of its corner — a missing image here reads as a broken shape,
    not as a missing image.
- **The card has NO fixed height** — it is set by the quote, and flex makes every
  card in the track match the tallest. Verified 496x442 at 1440 and 334x362 at 390,
  with zero content overflow on a 7-line quote.
- The 23.78px radius lives in the clip path itself rather than a `border-radius`;
  putting both on would round an already-rounded shape. **Note `SolutionsSection`'s
  cards use 25px**; if the two frosted-card treatments are meant to match, that is
  one number to settle.
- **The logo plate has no fill and no shadow** — it is a positioning box, not a
  surface. The notch is cut out of the card, so what shows behind the logo is the
  page itself; a white plate on a white page was only contributing a shadow edge.
  Its `border-radius` went with them, since with no background it clipped nothing.
- **The logo is capped at `max-width: 100px`** against a `2.25rem` height.
  `object-fit: contain` is what keeps a wide mark's proportions once the cap binds
  — max-width plus a fixed height would otherwise squash it horizontally. Verified:
  the live 124x50 mark renders 89x36, under the cap; forcing a taller height clamps
  the box to 100px wide and `contain` preserves the aspect.
- **The progress bar is a fixed-width thumb that slides**, not a bar that grows —
  it reads as a position indicator rather than a loading bar. `--progress` runs
  0 to 1 and the translate covers exactly the remaining rail.
- **The quote mark is drawn (`QuoteMark.js`)**, not typed: the design's mark is two
  hard-edged slabs and no font's “ glyph is close enough. One SVG, rotated a half
  turn for the closing pair.

### Solutions (added with the solutions build)
- **The solution card title is the one real type conflict here.** The design
  specifies **24px**, and the heading scale has no 24px desktop step
  (`--fs-heading-sm` is 32px). `--fs-body-xl` is the only token that is 24px on
  desktop, so `.itemTitle` is an `<h3>` reading a **body** token. Consequences:
  it drops to **20px on tablet and 16px on mobile**, where it lands on exactly
  the same size as the copy beneath it and is separated by weight (700) alone.
  If the card title should stay visibly above body copy at every tier, that is a
  **new heading step at 24/24/20** (or similar) declared in all three blocks —
  a deliberate scale addition, not a component one-off.
- Every other size on the section is a straight token: heading
  `--fs-heading-md` (40px, overriding the `h2` default), stat value
  `--fs-heading-md`, and the lede, solution copy and stat labels all take the
  **global `p` default** (`--fs-body-base`, 18px) with no font-size written in
  the module at all.
- **`--color-text-muted` was added** — see §3. `HeroSection.module.css` was
  repointed at it in the same change, so there is no `#4a4a4a` left in `src/`.
- **`use_stats` picks a whole LAYOUT, not just whether a card shows.**
  - `true` — **split**: heading, lede and the blue stats card down a narrow left
    column, the solutions listed in a wider right one. 1348px tall at 1440.
  - `false` — **stacked**: heading and lede centred across the full measure, the
    solutions in a two-up grid beneath. No card, **and no swoosh** — the arc is
    anchored to the card's top edge, so with no card there is nothing for it to
    meet, and the stacked reference shows no arc. 928px tall at 1440.
  - Both collapse to one centred column at `<= 1024px`, where they converge.
  - **At `<= 1024px` the split layout also drops its stats card and the blue
    arc**, so from there down the two layouts render identically. This uses the
    scale's existing collapse point rather than a breakpoint of its own — the
    same width at which the section goes to one column — so the card and the arc
    disappear exactly as the layout stacks, with no in-between state. **The site
    still has only two breakpoints, 1024px and 575px.**
  - **One rule hides both**, because the arc's backdrop is a *child* of
    `.statsBlock` (it anchors to the card's top edge). `display: none` on the
    block takes the artwork with it, so the two cannot get out of sync — hiding
    them separately would leave the arc floating against nothing the first time
    someone edited one rule and not the other. Verified: present at 1025px, gone
    at 1024px, no horizontal overflow at any width.
  - That also made the old `.backdrop` re-anchoring rules in the `<= 1024px`
    block **dead code** — with the block hidden its children never render — so
    they were removed. `.statsBlock`'s comment records what to restore if the
    card is ever brought back below 1024px.
  - The modifiers (`.withStats` / `.noStats`) are **(0,2,0) selectors**, so every
    value they set has to be matched at that specificity to be overridden in a
    media query — a bare `.description` loses to `.noStats .description` even
    inside `@media (max-width: 1024px)`. That is why several rules in the narrow
    blocks are written `.item, .noStats .item`.
  - The stacked layout's cards use `padding: 2rem; gap: 2rem` against the split
    layout's 2.5rem/3rem. **Measured**: that leaves a 403px text column against
    the reference's ~404, which is what keeps "Seamless Shopify Integrations"
    (376px) on one line. At the split layout's values it was 371px and wrapped.
- **The layout is one responsive grid, not two designs.** Desktop is 5fr/7fr —
  heading + lede + stats card on the left, the solution list on the right.
  At `<= 1024px` it collapses to a single centred column (the intro centres, the
  solution rows stay left-aligned) and the stats card goes two-across; at
  `<= 575px` the card goes single-column. Both existing breakpoints, no new tier.
- **THE STACKED HEADING'S LINE BREAK CANNOT BE A MEASURE, so `<br>` is parsed.**
  The reference breaks it "High-impact Shopify / solutions to grow your startup".
  That needs a `max-width` which fits "solutions to grow your startup" (**608px** —
  the accents are bold, so the line is wider than the same text plain) but not
  "High-impact Shopify solutions" (**603px**). No number is both, and
  `text-wrap: balance` picks the other split because it minimises the longest
  line. So the parser honours `<br>` and the break is authored in the title:
  `High-impact Shopify <br> solutions to <span class="blue-gradient">grow</span> your <span class="blue-gradient">startup</span>`
  `.noStats .title`'s 26ch is then a **ceiling** (it just has to clear 608px so it
  never adds a break of its own), not the thing producing the break. Without the
  `<br>` the heading still sets on two lines, just turning one word later.
- **The heading's accents are authored, not hardcoded**, the same convention as
  the hero headline and the partners heading — and this component accepts
  **both**: `<strong>`/`<b>` for a bold run in the body colour, and
  `<span class="blue-gradient">` / `"green-gradient"` for a bold gradient run.
  Parsed, never injected. The live title carries **no markup**, so it currently
  renders flat; the design wants:
  `High-impact Shopify solutions to <span class="blue-gradient">grow</span> <strong>your</strong> <span class="blue-gradient">startup</span>`
- **The stats card gradient runs top-to-bottom (180deg), not on the 135deg
  diagonal** — `--color-brand` at the top into `--color-brand-dark` at the
  bottom, so it is lightest at the top. Specified by design. Every other gradient
  on the site is the 135deg diagonal (buttons, partners block, headline accents),
  so this card is the single deliberate exception; it is not a mistake to
  straighten out.
- **The divider rule between icon and copy is a raw `#e3e3e3`** — one consumer,
  a hairline border rather than text. Promote it if a second component needs it.
- **The icon column width is a local custom property (`--icon-size`)** on the
  section: 106px / 80px / 56px. One value drives the image and the grid column,
  so every divider lines up down the list no matter how tall an icon is. 106px is
  the icons' native SVG width.
- **The Learn More buttons use `arrow="rise"`** — straight → at rest, swinging up
  to ↗ on hover, alongside the `secondary` fill inversion. See §4.
- **The solution order is pinned in code, not driven by the CMS.** The live
  `solution` list is authored in the exact reverse of the design, and the Shopify
  admin connector was unavailable to fix it at the source, so
  `SolutionsSection.js` carries a `SOLUTION_ORDER` array of handles and sorts by
  it. **Consequence: dragging the items in the admin no longer changes anything.**
  Deleting `SOLUTION_ORDER` and the `inDesignOrder()` call hands ordering back to
  the CMS in one edit. A handle not in the array sorts after every listed one and
  keeps its CMS position among the other unlisted ones, so a fifth solution added
  in the admin is appended rather than dropped.
- **Each solution row is a frosted card** — `rgba(255, 255, 255, 0.9)` +
  `backdrop-filter: blur(12.5px)` + `border-radius: 25px`, specified by design.
  Near-opaque white means it is invisible against the page background and reads
  as glass only where the swoosh passes behind it. The `-webkit-` prefix stays
  (Safari still needs it); with neither prefix supported the rgba fill alone is a
  clean fallback, so there is no `@supports` guard.
- **The row gap is 0**, per design — the cards stack flush and their radii meet.
  That makes the card padding the ONLY thing separating one row's copy from the
  next, so it is the single number that controls the list's vertical rhythm.
- **The card's padding is inferred** — the treatment was specified without one,
  and a 25px radius needs something to round. `2rem` desktop (1.5rem tablet,
  1.25rem mobile) gives 4rem of copy-to-copy spacing with the gap at 0. If design
  has a real padding, that's the one number to change.
- **The section lede is a FALLBACK constant in the component, not CMS copy.**
  The `solutions` definition has no description field and the Admin connector was
  unauthorized, so `FALLBACK_DESCRIPTION` in `SolutionsSection.js` stands in for
  it. Adding a `description` / `paragraph` / `subtitle` field in the admin takes
  over with no code change — **delete the constant when that happens**, because
  marketing copy sitting in a component is exactly what a headless CMS is meant
  to prevent. Its presence is also load-bearing for the layout: the paragraph is
  132px tall, and without it the stats card sat 119px above the reference.
- **The section was calibrated against a headless 1440px render**, not eyeballed:
  Chrome renders the page, a script measures the boxes, and the numbers are
  compared with the reference (which is 1440x1330). That loop set `.inner`'s
  4rem padding, the cards' 2.5rem, the stats gap and `.title`'s 16ch measure.
  Result at 1440: section **1348px** tall against the reference's 1330, stats
  card **x 128..519** against 120..510, card top **397** against 384. Reproduce it by adding a temporary route
  that renders the section alone — the hero's `100vh` otherwise inflates with the
  capture window. (Note an `_`-prefixed app directory is a Next private folder
  and will 404.)
- **`.title` is capped at 16ch, not 20ch** — 20ch broke the headline as
  "High-impact Shopify / solutions to grow your / startup" instead of the
  reference's "High-impact / Shopify solutions to / grow your startup".
- **The swoosh is anchored to the stats card, not to the section.** Its backdrop
  hangs off `.statsBlock` with `bottom: 100%` — putting the SVG's bottom edge on
  the card's top — then `translateY(var(--swoosh-underside))` pushes it back down
  by a share of the SVG's own height so the ARC's underside lands there instead.
  - **A fixed offset from the section top cannot work.** The two things move
    independently: the arc holds the 1440x604 ratio so its height scales with the
    VIEWPORT WIDTH, while the card's top is set by how many lines the heading and
    lede wrap to. Measured with no offset, the arc's underside at the card's left
    edge sits at y **387 / 545 / 733** for widths of 1025 / 1440 / 1920 — against
    a card top of ~400 throughout. No constant meets all three. An earlier
    `--swoosh-lift: 156px` did meet it at 1440 and nowhere else.
  - `--swoosh-underside` is **16%**, chosen so the two meet at every desktop
    width rather than at one. Measured overlap of the arc over the card's top
    edge: **10 / 12 / 15 / 19 / 23px** at 1025 / 1280 / 1440 / 1920 / 2560 — it
    grows with the viewport, as the reference's does, and never opens a gap.
  - **The space above the card lives on `.statsBlock`, not on `.stats`**, so the
    block's top edge and the card's top edge are the same line — which is what
    the backdrop anchors to. With the margin on `.stats` the anchor sat 1.5rem
    above the card and `--swoosh-underside` had to absorb the difference, which
    made it two numbers pretending to be one. Moving `.statsBlock`'s margin now
    moves the card and the swoosh together.
  - **`--window-size` is not a layout viewport below ~500px.** Chrome clamps the
    window, so a `--window-size=400` screenshot is 400px of a much wider render —
    it looks like catastrophic overflow and is an artifact. Use CDP
    `Emulation.setDeviceMetricsOverride` for any narrow-width check; measured
    that way, 390px has `document.scrollWidth === 390` and nothing overflows.
  - CDP `Page.captureScreenshot` with `captureBeyondViewport` draws a small dark
    badge into the image. It is a capture artifact — it does not appear in a
    plain `--screenshot` of the same page. Don't go hunting for it in the DOM.
  - To measure the overlap, render the section twice — once normally, once with
    `[class*="backdrop"]{display:none}` injected — and diff the two. The arc and
    the card are the same blue, so they cannot be told apart in a single render.
  - The horizontal offset walks back out to the viewport edge:
    `left: calc(-1 * (max(0px, (100vw - var(--max-width)) / 2) + var(--space)))`
    with `width: 100vw`, valid because `.statsBlock` starts at the content edge.
  - **`.solutions` is `overflow: clip`** (not `hidden`, which would create a
    scroll container) — the artwork is 100vw wide and taller than the space above
    the card, so it overhangs on three sides and must be trimmed. Without this it
    paints up over the partners section and widens the page.
  - **`.statsBlock` renders even with no stats**, so an empty stats list can't
    take the artwork with it.
  - At `<= 1024px` `.statsBlock` drops to `position: static`, which hands the
    backdrop's containing block back to `.solutions`, and the backdrop goes to
    `top: 0` — one column there, so there is nothing beside the arc to meet.
- **The arc still does not reproduce the reference's placement, and cannot as
  supplied.** At 100% width the given path shows a **46px** sliver at the
  section's top edge; the reference shows ~**240px**. Solving for a scale and
  offset that produce both the top width and the left crossing needs ~**2.2x**
  the section width, so the reference's artwork is a larger composition and this
  SVG is one path lifted out of it. The lift above matches the one relationship
  that was specified (arc meets card); the rest needs the real artwork.
- **The stats card's geometry is measured, not guessed.** Both reference images
  agree as *ratios of the content measure* (which is scale-independent, unlike
  reading pixels off a screenshot): the card is ~31% of the measure, not the ~40%
  the left grid column would give it, it is inset from that column's left edge
  rather than flush, and its stats run ~141px value-top to value-top. Hence
  `max-width: 23.5rem`, `margin-left: 2rem`, `padding: 2rem`, `gap: 4rem`. Both
  the cap and the inset come off at `<= 1024px`, where the card owns the width.
- **The stats card's radius moved 24px -> 25px** to match. 24px was an invented
  value from the initial build; 25px is the specified one, so the section now has
  a single radius rather than two that differ by a pixel.
- **The section became full-bleed to carry the swoosh.** `--max-width` and the
  gutters moved from `.solutions` onto `.inner`, so the section box spans the
  viewport while the content keeps exactly the measure it had (everything is
  border-box, so the numbers didn't change). The blue arc is pinned to the top at
  `width: 100%`, `z-index: -1`, inside an `isolation: isolate` context — the same
  arrangement as the hero's artwork.
- **The swoosh is drawn in `SwooshBackdrop.js`, not authored in Shopify.** The
  `solutions` metaobject has no image field, so the Figma export lives in the
  component. Its gradient stops read `--color-brand-dark` / `--color-brand`
  instead of the raw hexes the export shipped (identical colours), and its
  gradient id is namespaced `ltcSolutionsSwoosh` rather than `paint0_linear_*`,
  so a second pasted export can't collide with it. Same two edits as
  `ChevronsDownIcon`.
- **It renders at every width**, scaling with the 1440x604 aspect ratio. The
  mobile reference shows no swoosh — if it is meant to be desktop-only, that is a
  `display: none` in the `<= 575px` block, not a change to the artwork.
- **The stacked layout has two blurred accents** (`BlueDot.js`, `GreenGlow.js`),
  rendered only when `use_stats` is false — the split layout has the swoosh and
  the stats card carrying the colour, and its reference shows neither.
  - **They anchor to different boxes on purpose.** `.blueDot` hangs off `.inner`,
    so `left: var(--space)` lands it exactly on the content's left edge at any
    width. Anchoring it to the section would mean walking back out with a
    `calc(... 100vw ...)`, and 100vw includes the scrollbar — which would push it
    ~15px off the text edge on Windows. `.greenGlow` hangs off the section,
    because it is meant to bleed off the page edge rather than line up with text.
  - Both render at native size (68x68, 113x175). They are punctuation, not
    artwork that has to line up with anything, so they do not scale.
  - **The dot crosses to the top-RIGHT at `<= 575px`**, per the narrow reference,
    bleeding ~43% off the edge (`right: -1.5rem`; `.solutions`'s `overflow: clip`
    is what trims it). `left: auto` is required in that rule — with both `left`
    and `right` set on a non-stretched absolute box, `left` wins and the override
    does nothing. **Tablet (576-1024px) keeps it on the left**: only desktop and
    mobile were given, and 575px is the scale's existing mobile tier rather than
    a new breakpoint.
  - `GreenGlow`'s circle is centred *outside* its own viewBox (cx 25.5, r 74.5 in
    a 113-wide box), so only its right-hand edge shows. That is the artwork, not a
    clipping bug.
  - The blur is a real `feGaussianBlur` inside each SVG, not a CSS filter.
  - `BlueDot`'s stops read the brand tokens; `GreenGlow`'s stay raw hexes, for the
    same reason as the green swoosh's did (the green tokens are contrast-tuned for
    *text* and reusing them would retune the hero headline's green word).
  - Both files namespace their gradient AND filter ids. Figma names the first of
    each identically in every export (`paint0_linear_*`, `filter0_f_*`) and
    `url(#id)` resolves to the first match in the document, so two un-namespaced
    exports on one page silently share one definition.
- **There is no green swoosh.** One was built from a Figma export and then
  removed on request; only the blue arc at the top remains. Two things worth
  keeping if it ever comes back: (a) the export's `<foreignObject>` +
  `backdrop-filter: blur(50px)` + 1%-opacity white `<rect>` is Figma's
  *background* blur and is wrong here — at `z-index: -1` it blurs the page behind
  the artwork rather than softening the shape, and softening is `filter: blur()`;
  (b) a bottom-anchored artboard usually carries empty space below its lowest
  point, so it needs a `translateY` nudge (measured 5.9% for the 2093x1149
  export, 9.85% for the 1440x1149 one) before the shape actually meets the next
  section.
- **`.solutions` keeps `overflow: clip`** — it is the blue arc that needs it (100vw
  wide and taller than the space above the stats card), not the green one.
- **The section lede is a FALLBACK constant in the component, not CMS copy.**
  The `solutions` definition has no description field and the Admin connector was
  unauthorized, so `FALLBACK_DESCRIPTION` in `SolutionsSection.js` stands in for
  it. Adding a `description` / `paragraph` / `subtitle` field in the admin takes
  over with no code change — **delete the constant when that happens**, because
  marketing copy sitting in a component is exactly what a headless CMS is meant
  to prevent. Its presence is also load-bearing for the layout: the paragraph is
  132px tall, and without it the stats card sat 119px above the reference.
- **The section was calibrated against a headless 1440px render**, not eyeballed:
  Chrome renders the page, a script measures the boxes, and the numbers are
  compared with the reference (which is 1440x1330). That loop set `.inner`'s
  4rem padding, the cards' 2.5rem, the stats gap and `.title`'s 16ch measure.
  Result at 1440: section **1348px** tall against the reference's 1330, stats
  card **x 128..519** against 120..510, card top **397** against 384. Reproduce it by adding a temporary route
  that renders the section alone — the hero's `100vh` otherwise inflates with the
  capture window. (Note an `_`-prefixed app directory is a Next private folder
  and will 404.)
- **`.title` is capped at 16ch, not 20ch** — 20ch broke the headline as
  "High-impact Shopify / solutions to grow your / startup" instead of the
  reference's "High-impact / Shopify solutions to / grow your startup".
- **The swoosh is anchored to the stats card, not to the section.** Its backdrop
  hangs off `.statsBlock` with `bottom: 100%` — putting the SVG's bottom edge on
  the card's top — then `translateY(var(--swoosh-underside))` pushes it back down
  by a share of the SVG's own height so the ARC's underside lands there instead.
  - **A fixed offset from the section top cannot work.** The two things move
    independently: the arc holds the 1440x604 ratio so its height scales with the
    VIEWPORT WIDTH, while the card's top is set by how many lines the heading and
    lede wrap to. Measured with no offset, the arc's underside at the card's left
    edge sits at y **387 / 545 / 733** for widths of 1025 / 1440 / 1920 — against
    a card top of ~400 throughout. No constant meets all three. An earlier
    `--swoosh-lift: 156px` did meet it at 1440 and nowhere else.
  - `--swoosh-underside` is **16%**, chosen so the two meet at every desktop
    width rather than at one. Measured overlap of the arc over the card's top
    edge: **10 / 12 / 15 / 19 / 23px** at 1025 / 1280 / 1440 / 1920 / 2560 — it
    grows with the viewport, as the reference's does, and never opens a gap.
  - **The space above the card lives on `.statsBlock`, not on `.stats`**, so the
    block's top edge and the card's top edge are the same line — which is what
    the backdrop anchors to. With the margin on `.stats` the anchor sat 1.5rem
    above the card and `--swoosh-underside` had to absorb the difference, which
    made it two numbers pretending to be one. Moving `.statsBlock`'s margin now
    moves the card and the swoosh together.
  - To measure the overlap, render the section twice — once normally, once with
    `[class*="backdrop"]{display:none}` injected — and diff the two. The arc and
    the card are the same blue, so they cannot be told apart in a single render.
  - The horizontal offset walks back out to the viewport edge:
    `left: calc(-1 * (max(0px, (100vw - var(--max-width)) / 2) + var(--space)))`
    with `width: 100vw`, valid because `.statsBlock` starts at the content edge.
  - **`.solutions` is `overflow: clip`** (not `hidden`, which would create a
    scroll container) — the artwork is 100vw wide and taller than the space above
    the card, so it overhangs on three sides and must be trimmed. Without this it
    paints up over the partners section and widens the page.
  - **`.statsBlock` renders even with no stats**, so an empty stats list can't
    take the artwork with it.
  - At `<= 1024px` `.statsBlock` drops to `position: static`, which hands the
    backdrop's containing block back to `.solutions`, and the backdrop goes to
    `top: 0` — one column there, so there is nothing beside the arc to meet.
- **The arc still does not reproduce the reference's placement, and cannot as
  supplied.** At 100% width the given path shows a **46px** sliver at the
  section's top edge; the reference shows ~**240px**. Solving for a scale and
  offset that produce both the top width and the left crossing needs ~**2.2x**
  the section width, so the reference's artwork is a larger composition and this
  SVG is one path lifted out of it. The lift above matches the one relationship
  that was specified (arc meets card); the rest needs the real artwork.
- **The stats card's geometry is measured, not guessed.** Both reference images
  agree as *ratios of the content measure* (which is scale-independent, unlike
  reading pixels off a screenshot): the card is ~31% of the measure, not the ~40%
  the left grid column would give it, it is inset from that column's left edge
  rather than flush, and its stats run ~141px value-top to value-top. Hence
  `max-width: 23.5rem`, `margin-left: 2rem`, `padding: 2rem`, `gap: 4rem`. Both
  the cap and the inset come off at `<= 1024px`, where the card owns the width.
- **The stats card's radius moved 24px -> 25px** to match. 24px was an invented
  value from the initial build; 25px is the specified one, so the section now has
  a single radius rather than two that differ by a pixel.
- **The section became full-bleed to carry the swoosh.** `--max-width` and the
  gutters moved from `.solutions` onto `.inner`, so the section box spans the
  viewport while the content keeps exactly the measure it had (everything is
  border-box, so the numbers didn't change). The blue arc is pinned to the top at
  `width: 100%`, `z-index: -1`, inside an `isolation: isolate` context — the same
  arrangement as the hero's artwork.
- **The swoosh is drawn in `SwooshBackdrop.js`, not authored in Shopify.** The
  `solutions` metaobject has no image field, so the Figma export lives in the
  component. Its gradient stops read `--color-brand-dark` / `--color-brand`
  instead of the raw hexes the export shipped (identical colours), and its
  gradient id is namespaced `ltcSolutionsSwoosh` rather than `paint0_linear_*`,
  so a second pasted export can't collide with it. Same two edits as
  `ChevronsDownIcon`.
- **It renders at every width**, scaling with the 1440x604 aspect ratio. The
  mobile reference shows no swoosh — if it is meant to be desktop-only, that is a
  `display: none` in the `<= 575px` block, not a change to the artwork.
- **The green swoosh is anchored to the section's BOTTOM edge**, full width, so
  it meets the next section with no gap. It is an out-of-flow layer, so it cannot
  crop or shorten the section itself.
  - **The artboard is 2093x1149** — the wide export, in which the whole path fits
    (x 0 to ~2029) rather than being clipped at the left. It is much shallower per
    unit of width than the blue arc (1149/2093 against 1149/1440), so at 100%
    width it renders roughly half the height the first 1440-wide green export did
    and sits comfortably inside the section.
  - **It needed a 5.9% downward nudge (`--green-swoosh-tail`).** The artwork's
    lowest point is y~1081 of the 1149 viewBox, so the box carries an empty tail
    below the shape and, flush at `bottom: 0`, the green stopped short of the
    boundary. The nudge pushes that tail past it, where `overflow: clip` eats it.
    Verified touching (gap 0px) at 1025 / 1440 / 1920 / 2560.
    (The earlier 1440-wide export needed 9.85% — its lowest pixels sat outside
    the viewBox, so more of its box was empty. Re-measure if the artboard changes.)
  - A `translateY`, not a negative `bottom`: percentages resolve against the
    *container's* height on `bottom` but the *element's own* on `translateY`,
    which is what lets one value hold at every width.
  - `overflow: clip` still trims any overhang, which on a bottom-anchored shape
    is the right end to lose.
  - **The export's Figma background-blur was dropped** — a `<foreignObject>` with
    `backdrop-filter: blur(50px)` and a 1%-opacity white `<rect>`. At `z-index: -1`
    that would blur the page *behind* the artwork, not soften the shape, and it
    would stand up a 1440x1149 blur surface beside cards already running their own
    `backdrop-filter`. **The reference's green does look softer than what renders**
    — if that softness is wanted it is `filter: blur()` on the SVG, a different
    effect worth confirming against the design.
  - **Its gradient stops stay raw hexes** (`#80EA71` / `#298C6D`). They are NOT
    the green tokens: `--color-accent-green` and `--color-accent-green-dark` are
    contrast-tuned because they colour *text*, and pointing this at them would
    silently retune the hero headline's green word. One consumer, so they stay
    raw. (`#298C6D` is the same value cited above as the artwork's dark green —
    re-deriving the text token from it is a separate, deliberate change.)

### Footer (added with the footer build)
- **`--max-width` went 72rem -> 78rem (1152px -> 1248px)** and the header capsule
  now reads the token instead of its own 1200px. One page measure for the whole
  site; see §5. Every section got 96px wider as a result.
- **Two new tokens invert the scale** (`--fs-footer-heading`,
  `--fs-footer-link`). This is the system's only inverted pair — see §2. The
  tablet values are a judgement call: only desktop and mobile were specified.
- **The footer collapses at <= 1024px**, the header's existing breakpoint, rather
  than a new one. That means a 900px tablet gets the stacked layout and the
  larger mobile type, which is early for a device with room for three columns —
  deliberate, but revisit if tablets matter.
- **Columns are content-sized, not equal thirds.** `repeat(4, auto)` with
  `justify-content: space-between`, because in the reference the About Us column
  is visibly wider than Pages — they are sized by their longest label. Equal
  `1fr` columns put About Us ~5% too far right; content sizing lands every
  column within ~2% of the design.
- **The link list carries the font-size, not just the link.** The `li` would
  otherwise keep the inherited body metrics (18px/1.5) and, because `.link` is an
  inline-flex child, the row height comes from the li's line box — which made
  every link gap ~8px too large at both tiers. Sizing `.menu` fixes desktop and
  mobile at once.
- **The envelope icon is inferred, not authored.** The contact column is an
  ordinary Shopify menu with no icon field, so `Footer.js` shows `MailIcon` when
  an item's link is a `mailto:` **or** its label parses as an email address. In
  the second case the href is rewritten to `mailto:<label>` — an email label
  pointing at a page is never what's meant.
- **`toRelativePath` now leaves non-web schemes alone.** It used to run every
  menu URL through `new URL().pathname`, which turns
  `mailto:info@lowerthecurve.com` into the relative path `info@lowerthecurve.com`
  — a broken link. Only `http:`/`https:` get relativized now. This was a
  pre-existing bug; it just had no `mailto:` in a menu to expose it.
- **The copyright line was removed.** The previous footer had one; neither
  reference image shows it. Add it back as a row inside `.inner` if it's needed
  for legal reasons.
- **White is hardcoded as `#ffffff`**, matching `Button.module.css`, rather than
  a new `--color-on-brand` token. If a third white-on-brand surface appears,
  promote it.
- **The gradient stops are `--color-brand-dark` -> `--color-brand-darker` at
  135deg** — both existing tokens, no new colour. The exact stops are estimated
  from the reference screenshot; if the design's navy is deeper than
  `--color-brand-darker` (#003a9e), that's a new token and a deliberate addition.
