// Fragments for PartnerDetailExploreMoreSection — the "Explore More Case
// Studies" row that closes the partner page.


export const partnerDetailExploreMoreSectionFragment = /* GraphQL */ `
  fragment PartnerDetailExploreMoreSectionFields on Metaobject {
    id
    type
    handle
    fields {
      key
      type
      value
    }
  }
`;

export const partnerDetailExploreMoreCardFragment = /* GraphQL */ `
  fragment PartnerDetailExploreMoreCardFields on Metaobject {
    id
    type
    handle
    updatedAt
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
      references(first: 20) {
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
            }
          }
        }
      }
    }
  }
`;
