// Minimal Shopify Storefront API client.
//
// Everything here runs server-side (Server Components / Server Actions), so the
// Storefront access token never reaches the browser. As the storefront grows,
// add more query/helper functions alongside `getShopMetafields` below.

import {
  getHomePageQuery,
  getServicesPageQuery,
  getHeaderQuery,
  getFooterQuery,
} from './queries';

// Accept either a full myshopify domain ("lower-the-curve.myshopify.com") or
// just the store slug ("lower-the-curve") and normalize to the full host.
const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
const domain = rawDomain
  ? rawDomain.includes('.')
    ? rawDomain
    : `${rawDomain}.myshopify.com`
  : null;
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2025-01';

const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : null;

/**
 * Low-level GraphQL request against the Storefront API.
 *
 * @param {Object} params
 * @param {string} params.query   GraphQL query/mutation string.
 * @param {Object} [params.variables]  GraphQL variables.
 * @param {RequestCache} [params.cache]  fetch cache mode. Defaults to 'no-store'
 *   so the storefront always reflects the latest Shopify data (in dev AND
 *   production) without a rebuild. This makes routes dynamically rendered. For a
 *   specific call that can be cached, pass `cache: 'force-cache'` (optionally
 *   with `next: { revalidate }` upstream) to opt back into caching/ISR.
 * @returns {Promise<{ status: number, body: any }>}
 */
export async function shopifyFetch({
  query,
  variables,
  cache = 'no-store',
}) {
  if (!endpoint || !accessToken) {
    throw new Error(
      'Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and ' +
        'SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local (see .env.local.example).'
    );
  }

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache,
  });

  const body = await result.json();

  if (body.errors) {
    throw new Error(
      `Shopify Storefront API error: ${JSON.stringify(body.errors)}`
    );
  }

  return { status: result.status, body };
}

// ---------------------------------------------------------------------------
// Metafields
// ---------------------------------------------------------------------------
//
// Shop-level metafields hold reusable, store-wide content (e.g. a tagline, a
// support email, marketing copy). Each identifier is a { namespace, key } pair.
// Edit the list below to match the metafields defined in your Shopify admin
// (Settings > Custom data > Metafields).

const shopMetafieldIdentifiers = [
  { namespace: 'custom', key: 'page_title' },
];

const getShopMetafieldsQuery = /* GraphQL */ `
  query getShopMetafields($identifiers: [HasMetafieldsIdentifier!]!) {
    shop {
      metafields(identifiers: $identifiers) {
        namespace
        key
        type
        value
      }
    }
  }
`;

/**
 * Fetch the configured shop-level metafields.
 *
 * @returns {Promise<Record<string, { value: string, type: string }>>}
 *   A map keyed by "namespace.key" for easy lookup. Missing metafields are
 *   simply absent from the map.
 */
export async function getShopMetafields() {
  const { body } = await shopifyFetch({
    query: getShopMetafieldsQuery,
    variables: { identifiers: shopMetafieldIdentifiers },
  });

  const metafields = body?.data?.shop?.metafields ?? [];
  const map = {};

  for (const field of metafields) {
    if (field) {
      map[`${field.namespace}.${field.key}`] = {
        value: field.value,
        type: field.type,
      };
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Navigation menus
// ---------------------------------------------------------------------------
//
// Menus are managed in Shopify admin (Content > Menus). Each has a handle —
// the default main navigation is "main-menu". Menu item URLs come back as
// absolute online-store URLs; in a headless storefront we convert them to
// relative paths so links resolve against this app.

const getMenuQuery = /* GraphQL */ `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      title
      items {
        id
        title
        url
        items {
          id
          title
          url
        }
      }
    }
  }
`;

// Turn a Shopify menu item URL into a path relative to this storefront.
// e.g. "https://lower-the-curve.myshopify.com/collections/all" -> "/collections/all"
function toRelativePath(url) {
  if (!url) return '/';
  try {
    const parsed = new URL(url);

    // Only web URLs have a path worth relativizing. mailto: and tel: would
    // otherwise be shredded — `new URL('mailto:a@b.com').pathname` is
    // "a@b.com", which as an href is a broken relative link, not an email.
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Already a relative path (or unparseable) — return as-is.
    return url;
  }
}

/**
 * Fetch a navigation menu by handle and normalize its item URLs to paths.
 *
 * @param {string} [handle='main-menu']
 * @returns {Promise<Array<{ id: string, title: string, path: string,
 *   items: Array<{ id: string, title: string, path: string }> }>>}
 */
export async function getMenu(handle = 'main-menu') {
  const { body } = await shopifyFetch({
    query: getMenuQuery,
    variables: { handle },
  });

  const items = body?.data?.menu?.items ?? [];

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    path: toRelativePath(item.url),
    items: (item.items ?? []).map((sub) => ({
      id: sub.id,
      title: sub.title,
      path: toRelativePath(sub.url),
    })),
  }));
}

// ---------------------------------------------------------------------------
// Site chrome — header
// ---------------------------------------------------------------------------

/**
 * Fetch the `header` metaobject (logo, menu handle, CTA link + colours).
 * There is a single header entry, so we return the first node.
 *
 * @returns {Promise<object|null>} The header node, or null if none exists.
 */
export async function getHeader() {
  const { body } = await shopifyFetch({
    query: getHeaderQuery,
    variables: { first: 1 },
  });

  return body?.data?.metaobjects?.edges?.[0]?.node ?? null;
}

/**
 * Fetch the `footer` metaobject (logo, three column titles, three menu handles).
 * There is a single footer entry, so we return the first node.
 *
 * @returns {Promise<object|null>} The footer node, or null if none exists.
 */
export async function getFooter() {
  const { body } = await shopifyFetch({
    query: getFooterQuery,
    variables: { first: 1 },
  });

  return body?.data?.metaobjects?.edges?.[0]?.node ?? null;
}

// ---------------------------------------------------------------------------
// Metaobjects — reusable, structured content authored in Shopify admin
// (Settings > Custom data > Metaobjects). Each definition has a "type" (API
// identifier) and one or more entries. To be readable here, the definition's
// Storefront access must be set to "Public read".
// ---------------------------------------------------------------------------

const getMetaobjectsQuery = /* GraphQL */ `
  query getMetaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          handle
          type
          fields {
            key
            type
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Flatten a metaobject's `fields` array into a { key: { value, type, image } }
// map so components can read `entry.fields.title.value` directly.
function fieldsToMap(fields) {
  const map = {};
  for (const field of fields ?? []) {
    map[field.key] = {
      value: field.value,
      type: field.type,
      image: field.reference?.image ?? null,
    };
  }
  return map;
}

/**
 * Fetch all entries of a metaobject type.
 *
 * @param {string} type   The metaobject definition's API identifier (e.g. 'home').
 * @param {number} [first=20]
 * @returns {Promise<Array<{ id: string, handle: string, type: string,
 *   fields: Record<string, { value: string, type: string, image: object|null }> }>>}
 *   An empty array if the definition doesn't exist or has no (storefront-readable) entries.
 */
export async function getMetaobjects(type, first = 20) {
  const { body } = await shopifyFetch({
    query: getMetaobjectsQuery,
    variables: { type, first },
  });

  const edges = body?.data?.metaobjects?.edges ?? [];

  return edges.map(({ node }) => ({
    id: node.id,
    handle: node.handle,
    type: node.type,
    fields: fieldsToMap(node.fields),
  }));
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

/**
 * Fetch the "home" content metaobject and its resolved section references.
 *
 * @returns {Promise<object|null>} The `metaobject` node, or null if the
 *   "content" metaobject with handle "home" doesn't exist.
 */
export async function getHomePage() {
  const { body } = await shopifyFetch({
    query: getHomePageQuery,
    variables: { handle: { type: 'content', handle: 'home' } },
  });

  return body?.data?.metaobject ?? null;
}

/**
 * Fetch the "services" content metaobject and its resolved section references.
 *
 * @returns {Promise<object|null>} The `metaobject` node, or null if the
 *   "content" metaobject with handle "services" doesn't exist.
 */
export async function getServicesPage() {
  const { body } = await shopifyFetch({
    query: getServicesPageQuery,
    variables: { handle: { type: 'content', handle: 'services' } },
  });

  return body?.data?.metaobject ?? null;
}
