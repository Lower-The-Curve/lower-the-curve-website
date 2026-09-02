// The header is a single `header` metaobject (handle "main-menu") holding:
//   - `logo`                    : file_reference -> MediaImage (the site logo)
//   - `menu`                    : the handle of the Shopify menu to render
//   - `button`                  : link -> { text, url } for the CTA
//   - `button_background_color` : color -> CTA fill
//   - `button_color`            : color -> CTA label
//
// The fragment lives here rather than colocated in the component (the usual
// section convention) because Header fetches its own data: colocating it would
// make Header.js -> lib/shopify -> queries/header.js -> Header.js a cycle, and
// the fragment would be read while still in its TDZ.
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
