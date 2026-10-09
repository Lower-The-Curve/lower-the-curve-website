// Fragment for the `delivered` metaobject that DeliveredSection renders.
// Two reference lists: `cards` on the section, then `tags` on each card.
// Live keys are listed in DeliveredSection.js.
export const deliveredSectionFragment = /* GraphQL */ `
  fragment DeliveredSectionFields on Metaobject {
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
        }
      }
    }
  }
`;

// A delivered_card with updatedAt, for Latest / Random.
export const deliveredCardFragment = /* GraphQL */ `
  fragment DeliveredCardFields on Metaobject {
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
