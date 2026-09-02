# RULES

**Read this before you touch anything.** Hard boundaries for any developer or AI
assistant working in this repo.

These are **not preferences**. If a request would break a rule below, **stop and
say so** — name the rule, name what it collides with, and offer the in-system
alternative. Do not "just this once" your way around one. A rule bent quietly is
how the next dev copies the mistake.

This file is self-contained: it carries the constraints **and** the minimum
know-how to not break the build. Deeper reference lives in
[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) (full type scale, buttons, per-section
notes) and [.claude/agents/LTCBot.md](.claude/agents/LTCBot.md) (extended
recipes). Read those when the task goes past what's here.

---

## 0. The five ways this project actually breaks

Everything below is elaboration. These five cause the real outages:

1. **`npm run build` while `next dev` is running** → clobbers `.next`, every
   route 500s with `ENOENT _document.js`. See §11 to recover.
2. **A new section whose GraphQL fragment isn't spread into the page query** →
   the section renders nothing, silently. See §8.
3. **Reading section order off the metaobject's `fields` array** → the Storefront
   API returns it *alphabetically*, so the page renders in the wrong order. See §7.
4. **A secret leaking to the browser** (`NEXT_PUBLIC_`, a client component, a
   `console.log`) → the store token is public. See §5.
5. **A one-off font-size / hex / button dropped in beside the design system** →
   no visible break today, guaranteed drift in a month. See §2.

---

## 1. Scope — do only what was asked

- Build **exactly** the thing requested. No extra sections, pages, components,
  routes, config, dependencies, tests, or README edits nobody asked for.
- **No refactors on the side.** If you spot something worth changing outside the
  task, mention it in one line and leave the code alone.
- Keep diffs minimal. Touch the fewest files that can do the job.
- Don't delete or rewrite working code to make your change fit. Adapt to the
  existing structure, not the reverse.
- **Read a sibling file before adding a new one.** Every section component,
  query file and stylesheet in here follows one shape — match it.
- If the request is ambiguous in a way that changes the output, **ask**. If it's
  ambiguous in a way that doesn't, pick the obvious option and say which.

## 2. Design system — never add a one-off beside the token

Every font-size, brand colour and layout measure is **already a token** in
[src/app/globals.css](src/app/globals.css) and
[src/app/typography.css](src/app/typography.css). Use them.

**Forbidden without explicit approval:**

- a font-size that isn't on the scale below
- a second font family, or any font loading outside `typography.css`
- a hardcoded brand hex (`#106cfd`, `#004bc9`, …) anywhere but `globals.css`
- a new `Button` variant, or a bespoke button that isn't the shared component
- a new breakpoint

If the design calls for one of these, **stop and report the collision.** If the
user decides to extend the system on purpose, update `DESIGN-SYSTEM.md` **in the
same change** — an undocumented extension is itself a rule break.

### The type scale

Each token is declared three times under the same name — once per tier — so
`font-size: var(--fs-heading-xl)` is responsive with **no media query in your
component**. Tiers: desktop ≥1025px (`:root`), tablet 576–1024px, mobile ≤575px.

| Headings | D | T | M | Body | D | T | M |
|---|---|---|---|---|---|---|---|
| `--fs-heading-xl` | 64 | 52 | 40 | `--fs-body-xl` | 24 | 20 | 18 |
| `--fs-heading-lg` | 48 | 40 | 32 | `--fs-body-lg` | 22 | 18 | 16 |
| `--fs-heading-md` | 40 | 32 | 32 | `--fs-body-base` | 18 | 16 | 16 |
| `--fs-heading-sm` | 32 | 24 | 24 | `--fs-body-sm` | 16 | 16 | 14 |
| | | | | `--fs-body-xs` | 14 | 14 | 12 |

`h1`–`h4` and `p` **already map to their token**. Semantic markup needs no
font-size CSS at all — only override when the design genuinely differs.

**Inheritance trap:** the global `p` rule matches paragraphs directly, and a
direct declaration beats an inherited one no matter how specific the ancestor.
`.legal { font-size: var(--fs-body-xs) }` never reaches the `<p>`. Put the token
on the paragraph itself: `.legal p { font-size: var(--fs-body-xs) }`.

### Colour tokens

`--color-bg` `--color-text` `--color-ink` `--color-text-muted`
`--color-brand` `--color-brand-dark` `--color-brand-darker` `--color-brand-tint`
`--color-accent-green` `--color-accent-green-dark`

Brand gradient: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`.

**`--color-accent-green` is display-text only** — it clears 3:1 on white, not
4.5:1. Never on body copy, labels, or small UI text. It is **not**
interchangeable with `--color-brand` (4.58:1).

### Layout tokens

`--max-width` (78rem) · `--space` (1rem) · `--header-height` (104px / 93px ≤575px)

**Every section owns its own measure** — `max-width: var(--max-width); margin: 0
auto` plus `--space` gutters. A page's `main` sets **neither** max-width nor
padding, because that's the only way a full-bleed section can reach the viewport
edges. Never "fix" a too-wide section by constraining `main` — that caps every
sibling, full-bleed ones included.

## 3. Stack — fixed, not up for discussion

- Next.js **App Router**. **JavaScript + JSX only — no TypeScript.**
- **Plain `.css` files with BEM class names**, imported for side effect
  (`import './HeroSection.css'`). No CSS Modules, no Tailwind, no
  styled-components, no Sass, no Hydrogen, no external CMS.
- **Server Components by default.** `'use client'` only when state, events, or
  browser APIs are genuinely required — and say why.
- Shopify data via the **Storefront API** only. It uses
  `metaobject(handle: MetaobjectHandleInput)`; **`metaobjectByHandle` is Admin
  API — never here.**
- **No new dependencies.** Adding a package requires explicit approval, every
  time, dev dependencies included.

## 4. CSS class names — BEM, no exceptions

Class names ship to the DOM exactly as written, so BEM does the scoping that
hashing would.

```
.block                 .solutions
.block__element        .solutions__stat-value
.block--modifier       .solutions--with-stats
.block__element--mod   .btn__arrow--diagonal
```

- **One block per stylesheet**, named for the component in kebab-case. A file
  declares classes for its own block and nothing else.
- **Every selector is a single class.** Never nest a block's own element under
  another (`.solutions .solutions__item`) — it inflates specificity for nothing.
  The one legitimate descendant is a modifier reaching an element
  (`.solutions--no-stats .solutions__list`).
- **Modifiers are additive** — markup carries the base class *and* the modifier,
  so the base rule is written once.
- **No camelCase, no abbreviations, no hashes.** Hyphenate multi-word parts.
- In JSX write the class as a **string literal**; template literal only when
  conditional.
- Class names are global. `grep -rn "\.your-block" src/` before claiming a name.

## 5. Secrets and environment

- **Never print, log, echo, commit, or paste the contents of `.env.local`** or
  any token, key, or credential — not into code, a message, a comment, or a
  debug statement.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is **unprefixed and server-side only**.
  Never move a secret behind `NEXT_PUBLIC_`; never reference it from a client
  component.
- Never edit `.env.local`, `.gitignore`, or `next.config.mjs` without asking.

## 6. Commands you must not run

- **`npm run build`** — a `next dev` server is running; a build clobbers `.next`.
  Hot reload is the feedback loop. Only build if the user explicitly asks, or to
  debug a compile error you genuinely can't reason about.
- **`rm -rf`** on anything but `.next`, and only when recovering per §11.
- `npm install` / `uninstall` / anything that writes `package.json` or the
  lockfile, without approval.
- `git commit`, `git push`, `git reset --hard`, branch switches, force pushes,
  tag pushes, or **any** history rewrite — **only when the user asks for that
  specific action**. Approval for one commit is not approval for the next.
- `gh pr create` / `gh pr merge` / issue or release writes — ask first.
- Any **write** to the live Shopify store (products, collections, metaobjects,
  metafields, discounts, inventory, orders, customers) via MCP or the Admin API.
  **Reads are fine. Writes need explicit, per-action approval.**
- Anything that changes **state** in ClickUp, Fireflies, Slack, Notion, or Figma
  — tasks, comments, messages, files. Reads only unless asked.

## 7. Content model — and how to read content

- Reusable site content = **metaobjects**. Product-specific = **metafields**.
- A page's content is a `content` metaobject keyed by handle (`home`,
  `services`, …) with **one reference field per component slot**. Slot order IS
  render order. A slot may hold a single reference or a list.
- **The live API keys don't match the admin labels** — Shopify never renames a
  key when its display name changes, so home's slots are `sections`, `section_2`,
  `component_3`, …
- **Never read order off the metaobject's `fields` array.** The Storefront API
  returns it **alphabetically**, not in authored order. Alias the keys to
  `component1`…`componentN` in the page query (see `queries/home.js`) — that
  aliased list is the **one place render order lives**.

### The fetch path — four files, always in this order

1. **`src/lib/shopify/queries/<page>.js`** — the page query. Imports section
   fragments and spreads them; hardcodes no field selections. Re-exported from
   `queries/index.js` (barrel).
2. **`src/lib/shopify/index.js`** — `shopifyFetch` client plus one `getXPage()`
   helper per page, called with the right `{ type, handle }`. Returns the
   metaobject node or `null`.
3. **`src/app/<page>/page.js`** — Server Component: `await getXPage()`, normalize
   the aliased slots into a sections array, `switch (section.type)` to dispatch.
4. **The section component** — reads fields by key with `field(section, 'key')`
   and returns `null` if `!section`.

**Don't add a by-type `getX()` helper for a section the page's `content` entry
already references** — it fetches the same data twice and takes ordering out of
the CMS's hands.

**Verify a query live against the store before wiring it** (curl the Storefront
endpoint, check the real field shape). Never invent field keys.

## 8. Adding a section — the fragment is mandatory

Every section component exports **three** things:

1. `xSectionFragment` — a **colocated GraphQL fragment**:
   `fragment XFields on Metaobject { id type handle fields { key type value reference { ... } } }`
2. `X_SECTION_TYPE` — the metaobject type string used for dispatch.
3. default component `({ section }) => …` reading fields via `field()`.

Then — **do not skip a step**:

1. Create the component (`src/components/sections/<Name>/<Name>.js` + `.css`).
2. In `queries/<page>.js`: import the fragment, spread `...XFields` onto the
   section `reference` **AND** `references.nodes`, and append
   `${xSectionFragment}` to the query string. On `home.js` add it to the shared
   `PageComponentFields` fragment so the type can go in **any** slot.
3. Add `case X_SECTION_TYPE` to the page's `switch`.

**A section with no fragment spread into the query returns no data.** This is
the single most common failure in this repo — double-check it before reporting done.

### Adding a page

1. `queries/<page>.js` with `getXPageQuery`, composing section fragments.
2. Re-export from `queries/index.js`.
3. `getXPage()` in `lib/shopify/index.js` with the right `{ type, handle }`.
4. `src/app/<page>/page.js` + `page.css`, block `<page>-page` on the `<main>`.

## 9. Honesty about what you did

- Never claim something works because it "should". If you didn't verify it, say
  you didn't.
- If a step failed, was skipped, or was left out of scope, **say so explicitly**
  in the summary. Don't bury it.
- Don't invent Shopify field keys, API shapes, or file paths. Check, or say
  you're guessing.
- No fabricated data, fake content, or placeholder copy presented as real.

## 10. Self-check before reporting done

```bash
# raw values that should be tokens — all three should return nothing:
grep -rn "font-family" src/ | grep -v "app/typography.css\|app/globals.css"
grep -rnE "font-size: *[0-9]" src/ | grep -v "app/typography.css"
grep -rniE "#106cfd|#004bc9" src/ | grep -v "app/globals.css\|ArrowIcon.js"

# non-BEM class names — both should return nothing:
grep -rnE 'className=\{?"[^"]*[a-z][A-Z]' src/
grep -rnE '^\s*\.[a-z]+[A-Z]' src/

# a CSS Module should never come back:
grep -rn "module.css" src/

# a new section must appear in its page query:
grep -rn "SectionFragment" src/lib/shopify/queries/
```

Any hit is a rule break. Fix it or report it — **do not ship it silently.**

## 11. If the dev server is already broken

Symptom: every route 500s with `ENOENT … _document.js`. Cause: a `npm run build`
ran while `next dev` was up (§6).

```bash
# stop the dev server first, then:
rm -rf .next
npm run dev
```

This is the **only** sanctioned `rm -rf`. If that doesn't fix it, report the
actual error output — don't start deleting other directories.
