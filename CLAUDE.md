# CLAUDE.md

Project guidance for Claude Code working in this repo.

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

## Everything else

Stack conventions, the Shopify metaobject content model, the section-component
pattern, and step-by-step recipes for adding sections and pages live in
[.claude/agents/LTCBot.md](.claude/agents/LTCBot.md). Follow them.

Two habits that bite hardest here:
- **Never `npm run build`** after a change — a `next dev` server is running and
  hot reload is the feedback loop. A build while dev is running clobbers `.next`.
- **Never forget the colocated GraphQL fragment** when adding a section — a
  section whose fragment isn't spread into the page query returns no data.
