// The header is a single `header` metaobject (handle "main-menu") holding:
//   - `logo`                    : file_reference -> MediaImage (the site logo)
//   - `menu`                    : the handle of the Shopify menu to render
//   - `button`                  : link -> { text, url } for the CTA
//   - `button_background_color` : color -> CTA fill
//   - `button_color`            : color -> CTA label
//
// The fragment lives here, not in the component: query modules never import
// components. Colocating this one would also be a cycle — Header fetches its
// own data, so Header.js -> lib/shopify -> queries/sections/header.js ->
// Header.js, and the fragment would be read while still in its TDZ.
//
// Unlike the page sections beside it, the header isn't a slot in a page's
// `content` entry — it fetches itself (getHeader), so this file carries its
// query as well as its fragment.
export const headerFragment = /* GraphQL */ `
  fragment HeaderFields on Metaobject {
    id
    handle
    type
    fields {
      key
      type
      value
      reference {
        __typename
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
`;

// There is only ever one header entry, so callers take the first node.
export const getHeaderQuery = /* GraphQL */ `
  query GetHeader($first: Int!) {
    metaobjects(type: "header", first: $first) {
      edges {
        node {
          ...HeaderFields
        }
      }
    }
  }
  ${headerFragment}
`;
