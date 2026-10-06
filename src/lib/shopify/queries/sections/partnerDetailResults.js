// Fragment for the `partner_detail_results` metaobject that
// PartnerDetailResultsSection renders. It is not a slot in a `content` entry:
// the partner page reaches it through the `results` reference on its
// `partner_detail` entry (see queries/pages/partnerDetail.js), so the hero and
// this section always come from the same entry.
//
// `references` reaches the `partner_result` cards; each card's `reference`
// resolves its icon, which Shopify returns as a MediaImage or, for some SVGs,
// a GenericFile — both are selected.

export const partnerDetailResultsSectionFragment = /* GraphQL */ `
  fragment PartnerDetailResultsSectionFields on Metaobject {
    id
    type
    handle
    fields {
      key
      type
      value
      references(first: 50) {
        nodes {
          __typename
          ... on Metaobject {
            id
            type
            handle
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
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;
