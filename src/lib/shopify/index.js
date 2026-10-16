// Minimal Shopify Storefront API client.
//
// Everything here runs server-side (Server Components / Server Actions), so the
// Storefront access token never reaches the browser. As the storefront grows,
// add more query/helper functions alongside `getShopMetafields` below.

import {
  getHomePageQuery,
  getServicesPageQuery,
  getShopifyAppsPageQuery,
  getAppPopUpsQuery,
  getCaseStudiesPageQuery,
  getAboutUsPageQuery,
  getPartnerDetailPageQuery,
  getWhatWeBuiltQuery,
  getPartnerTestimonialQuery,
  getPartnerApproachIntroQuery,
  getCaseStudyMetricsQuery,
  getHeaderQuery,
  getFooterQuery,
} from './queries';

// Accept either a full myshopify domain ("lower-the-curve.myshopify.com") or
// just the store slug ("lower-the-curve") and normalize to the full host.
// Also tolerate a full URL ("https://lower-the-curve.myshopify.com/") — strip
// the scheme, any path, and the trailing slash before building the endpoint.
const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storeHost = rawDomain
  ? rawDomain.trim().replace(/^https?:\/\//i, '').split('/')[0]
  : null;
const domain = storeHost
  ? storeHost.includes('.')
    ? storeHost
    : `${storeHost}.myshopify.com`
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

  const raw = await result.text();
  let body;

  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    const preview = raw.replace(/\s+/g, ' ').trim().slice(0, 200);
    throw new Error(
      `Shopify Storefront API returned non-JSON (HTTP ${result.status}): ${preview || '(empty body)'}`
    );
  }

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

/**
 * Fetch the "shopify-apps" content metaobject and its resolved section references.
 *
 * @returns {Promise<object|null>} The `metaobject` node, or null if the
 *   "content" metaobject with handle "shopify-apps" doesn't exist.
 */
export async function getShopifyAppsPage() {
  const { body } = await shopifyFetch({
    query: getShopifyAppsPageQuery,
    variables: { handle: { type: 'content', handle: 'shopify-apps' } },
  });

  return body?.data?.metaobject ?? null;
}

// ---------------------------------------------------------------------------
// Shopify Apps popups
// ---------------------------------------------------------------------------

/**
 * Fetch every `app_pop_up` entry, one per Shopify Apps card's dialog.
 *
 * These are a by-type fetch on purpose — the page's `content` entry doesn't
 * reference them; each card's `button1` field does. See the comment in
 * queries/appPopUp.js for why reading them through the page query was rejected
 * (nested variant measured 1449; standalone 73, verified live).
 *
 * @param {number} [first=10]  entries to fetch. Matches the measured 73 cost;
 *   raise it when more than ten apps are authored.
 * @returns {Promise<Array<object>>} Raw metaobject nodes — the components read
 *   them by field key. Empty array if the definition has no entries.
 */
export async function getAppPopUps(first = 10) {
  const { body } = await shopifyFetch({
    query: getAppPopUpsQuery,
    variables: { type: 'app_pop_up', first },
  });

  return body?.data?.metaobjects?.nodes ?? [];
}

/**
 * Fetch the "Case Studies" content metaobject and its resolved section
 * references.
 *
 * The live handle is `content-hcmnjrrd` — Shopify generated it from the entry's
 * page name. Renaming the handle in the admin is a one-line change here.
 *
 * NOTE: there is a second "Case Studies" content entry in the store with
 * handle `content-o096zcnb`. It only references the Blackroll banner, so the
 * page uses `content-hcmnjrrd`, which holds both the Blackroll and Our Story
 * banners. Delete the stale entry in the admin, or point this handle at
 * whichever entry is canonical.
 *
 * @returns {Promise<object|null>} The `metaobject` node, or null if the
 *   "content" metaobject with that handle doesn't exist.
 */
export async function getCaseStudiesPage() {
  const { body } = await shopifyFetch({
    query: getCaseStudiesPageQuery,
    variables: { handle: { type: 'content', handle: 'content-hcmnjrrd' } },
  });

  return body?.data?.metaobject ?? null;
}

/**
 * Fetch the "about-us" content metaobject and its resolved section references.
 *
 * @returns {Promise<object|null>} The `metaobject` node, or null if the
 *   "content" metaobject with handle "about-us" doesn't exist.
 */
export async function getAboutUsPage() {
  const { body } = await shopifyFetch({
    query: getAboutUsPageQuery,
    variables: { handle: { type: 'content', handle: 'about-us' } },
  });

  return body?.data?.metaobject ?? null;
}

/**
 * Fetch the `partner_detail` entry for a partner.
 *
 * The URL key is the handle of the entry's `name` reference (a `partner`
 * entry) — e.g. `/partners/blackroll` — NOT the `partner_detail` entry's own
 * auto-generated handle, which Shopify derives from the copy and would change
 * with it. The Storefront API has no field-value filter on `metaobjects`, so
 * the query returns the entries and the match happens here.
 *
 * @param {string} partnerHandle  e.g. "blackroll"
 * @param {number} [first=50]     entries to fetch before matching.
 * @returns {Promise<object|null>} The `partner_detail` node, or null if no
 *   entry references a partner with that handle.
 */
export async function getPartnerDetailPage(partnerHandle, first = 50) {
  const { body } = await shopifyFetch({
    query: getPartnerDetailPageQuery,
    variables: { first },
  });

  const nodes = body?.data?.metaobjects?.nodes ?? [];

  const nameHandle = (node) =>
    node?.fields?.find((field) => field.key === 'name')?.reference?.handle;

  const node = nodes.find((node) => nameHandle(node) === partnerHandle);

  if (!node) return null;

  return {
    ...node,
    deliveredCards: body?.data?.deliveredCards?.nodes ?? [],
  };
}

/**
 * Fetch the `what_we_built` entry belonging to a partner.
 *
 * There is no reference field linking the two: the `partner` entry has no
 * `what_we_built` field and neither does `partner_detail`. The only link in the
 * live data is the parent's own `name` field ("Blackroll"), which matches the
 * referenced `partner` entry's `name`. So the match is made here, case- and
 * whitespace-insensitively, and a partner with no matching entry simply renders
 * no section.
 *
 * The Storefront API has no field-value filter on `metaobjects`, so the query
 * returns the entries and the match happens in code — same pattern as
 * getPartnerDetailPage() above.
 *
 * @param {object|null} partnerDetail  The `partner_detail` node from
 *   getPartnerDetailPage(), whose `name` reference carries the partner's name.
 * @returns {Promise<object|null>} The `what_we_built` node, or null.
 */
export async function getWhatWeBuilt(partnerDetail) {
  const partnerName = partnerDetail?.fields
    ?.find((field) => field.key === 'name')
    ?.reference?.fields?.find((field) => field.key === 'name')?.value;

  if (!partnerName) return null;

  const { body } = await shopifyFetch({ query: getWhatWeBuiltQuery });

  const nodes = body?.data?.metaobjects?.nodes ?? [];

  const nameOf = (node) =>
    node?.fields?.find((field) => field.key === 'name')?.value;

  const wanted = partnerName.trim().toLowerCase();

  return (
    nodes.find((node) => nameOf(node)?.trim().toLowerCase() === wanted) ?? null
  );
}

/**
 * Fetch the shared `approach` entry: the Approach section's heading and intro,
 * identical for every partner. The per-partner steps live on the partner's
 * `case_study_approach` entry instead.
 *
 * @returns {Promise<object|null>} The `approach` node, or null.
 */
export async function getPartnerApproachIntro() {
  const { body } = await shopifyFetch({ query: getPartnerApproachIntroQuery });

  return body?.data?.metaobjects?.nodes?.[0] ?? null;
}

/**
 * Fetch the `case_study_metrics` entry — the title and subtitle of the
 * "How key metrics moved" section.
 *
 * It is one shared entry: nothing links it to a partner (the partner's own
 * `partner_detail` entry carries the metric rows, read in the component), so
 * there is nothing to match on and the first entry is used. The Storefront API
 * has no field-value filter on `metaobjects`, so the query returns the entries
 * and the pick happens here — same pattern as getWhatWeBuilt() above.
 *
 * @param {object|null} partnerDetail  The `partner_detail` node from
 *   getPartnerDetailPage(); a missing partner means no section.
 * @returns {Promise<object|null>} The `case_study_metrics` node, or null.
 */
export async function getCaseStudyMetrics(partnerDetail) {
  if (!partnerDetail) return null;

  const { body } = await shopifyFetch({ query: getCaseStudyMetricsQuery });

  return body?.data?.metaobjects?.nodes?.[0] ?? null;
}

export async function getPartnerTestimonial(partnerDetail) {
  const partnerHandle = partnerDetail?.fields
    ?.find((field) => field.key === 'name')
    ?.reference?.handle?.trim()
    .toLowerCase();

  if (!partnerHandle) return null;

  const { body } = await shopifyFetch({ query: getPartnerTestimonialQuery });

  const nodes = body?.data?.metaobjects?.nodes ?? [];

  return (
    nodes.find((node) => {
      const handle = node?.handle?.toLowerCase() ?? '';

      return handle === partnerHandle || handle.startsWith(`${partnerHandle}-`);
    }) ?? null
  );
}
