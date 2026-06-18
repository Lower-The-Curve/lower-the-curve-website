# Lower the Curve — Headless Shopify Storefront

A headless Shopify storefront built with **Next.js (App Router)**, plain
**JavaScript/JSX**, and **CSS Modules + `globals.css`**. No TypeScript, no
Tailwind, no Hydrogen, no external CMS.

Shopify is integrated through the **Storefront API**, with site content driven
by Shopify **metafields** (and metaobjects later, as needed).

> Current state: minimal foundation. The app renders a single sample page and
> ships a server-side Storefront API client wired for metafields. Collections,
> products, cart, navigation, auth, search, analytics, and deployment are left
> for later.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Shopify credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   (Settings → Apps and sales channels → Develop apps → your app → API
   credentials → Storefront API access token).

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Project structure

```
src/
  app/
    layout.js          Root layout (imports globals.css)
    page.js            Sample homepage (Server Component)
    page.module.css    Styles for the homepage
    globals.css        Global styles + CSS variables
  lib/
    shopify/
      index.js         Storefront API fetch client + metafield helper
```

## Notes

- **Server Components by default.** Add Client Components (`'use client'`) only
  where interaction is required.
- **Token stays server-side.** The Storefront token is read from an unprefixed
  env var and used only in server code, so it never ships to the browser.
- **Metafields.** Edit `shopMetafieldIdentifiers` in
  [`src/lib/shopify/index.js`](src/lib/shopify/index.js) to match the metafields
  defined in your Shopify admin (Settings → Custom data).
