// The footer is a single `footer` metaobject holding:
//   - `logo`             : file_reference -> MediaImage (the white logo mark)
//   - `column_1_title`   : heading for the first link column ("Pages")
//   - `column_2_title`   : heading for the second column ("About Us")
//   - `column_3_title`   : heading for the third column ("Contact Us")
//   - `menu_1|2|3`       : the handle of the Shopify menu supplying each
//                          column's links (Content > Menus)
//
// Three columns is the design, so the shape is fixed at three rather than a
// repeatable list — a fourth column would be a content-model change, not just
// another entry.
//
// The fragment lives here rather than colocated in the component (the usual
// section convention) because Footer fetches its own data: colocating it would
// make Footer.js -> lib/shopify -> queries/footer.js -> Footer.js a cycle, and
// the fragment would be read while still in its TDZ. Same reasoning as header.js.
export const footerFragment = /* GraphQL */ `
  fragment FooterFields on Metaobject {
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

// There is only ever one footer entry, so callers take the first node.
export const getFooterQuery = /* GraphQL */ `
  query GetFooter($first: Int!) {
    metaobjects(type: "footer", first: $first) {
      edges {
        node {
          ...FooterFields
        }
      }
    }
  }
  ${footerFragment}
`;
