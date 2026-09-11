# CLAUDE.md

Project guidance for Claude Code working in this repo.

## Read RULES.md FIRST — it is binding

**[RULES.md](RULES.md) is the hard boundary for this repo.** Scope discipline,
the fixed stack, secret handling, the commands you must not run, and what needs
explicit approval before you touch it. Read it before you act, not after.

If a request would break a rule in there, **stop and say which rule and what it
collides with** — then offer the in-system alternative. Never work around a rule
quietly.

## Read the design system FIRST

**[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) is required reading before you write any
of the following:**

- a `font-family`, a font weight, or anything to do with **Poppins** / font loading
- any **font-size** (headings, body copy, labels, buttons — anything)
- any **button** (pill buttons, CTAs, arrow buttons, link buttons)
- any **brand blue** colour value
- any **breakpoint / responsive font sizing**

Fonts, a three-tier responsive type scale, brand colour tokens, and a single
shared `Button` component are **already built**. Read `DESIGN-SYSTEM.md`, then
reuse what's there.

### The rule that matters
Before adding a value or component in those areas, check whether it **collides
with something already built**. If the request needs a font-size that isn't on
the scale, a second font family, a new button variant, a different breakpoint, or
a hardcoded brand hex — **stop and tell the user what it conflicts with** and
offer either using the existing token or extending the system deliberately.

**Never silently add a one-off value beside the system.** That's how a design
system rots — the next dev copies the one-off instead of the token.

If you *do* extend the system on purpose, update `DESIGN-SYSTEM.md` in the same
change.

### Quick self-check before you finish
```bash
# should return nothing outside src/app/typography.css and globals.css:
grep -rn "font-family" src/ | grep -v "app/typography.css\|app/globals.css"
grep -rnE "font-size: *[0-9]" src/ | grep -v "app/typography.css"
grep -rniE "#106cfd|#004bc9" src/ | grep -v "app/globals.css\|ArrowIcon.js"
```
Any hit is a raw value that should be a token.

## CSS class names: BEM, and nothing else

There are **no CSS Modules** in this repo. Every stylesheet is a plain `.css`
file imported for its side effect, so class names reach the DOM exactly as
written — which is why they must be BEM:

```
.block                 .solutions
.block__element        .solutions__stat-value
.block--modifier       .solutions--with-stats
.block__element--mod   .btn__arrow--diagonal
```

One block per stylesheet, named for the component. Every selector is a single
class. Modifiers are additive — the markup carries the base class *and* the
modifier. No camelCase, no hashes, no abbreviations; hyphenate multi-word parts.

Full rules and the block inventory: **CSS naming** in
[.claude/agents/LTCBot.md](.claude/agents/LTCBot.md) and §6 of
[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

```bash
# should return nothing — a camelCase or hashed class name:
grep -rnE 'className=\{?"[^"]*[a-z][A-Z]' src/
grep -rnE '^\s*\.[a-z]+[A-Z]' src/
```

## Everything else

Stack conventions, the Shopify metaobject content model, the section-component
pattern, and step-by-step recipes for adding sections and pages live in
[.claude/agents/LTCBot.md](.claude/agents/LTCBot.md). Follow them.

Two habits that bite hardest here:
- **Never `npm run build`** after a change — a `next dev` server is running and
  hot reload is the feedback loop. A build while dev is running clobbers `.next`.
- **Never forget the colocated GraphQL fragment** when adding a section — a
  section whose fragment isn't spread into the page query returns no data.
