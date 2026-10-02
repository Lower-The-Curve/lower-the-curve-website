// Fragment for the `banner` metaobject that BannerSection renders. Same shape as
// the other sections': the page query spreads this and hardcodes no field
// selections of its own.
export const bannerSectionFragment = /* GraphQL */ `
  fragment BannerSectionFields on Metaobject {
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
      # first: 50 must match the other section fragments that select the
      # references field on a MetaobjectField (Solutions uses 50). GraphQL
      # merges same-typed selections and rejects differing arguments — 20 here
      # would conflict with Solutions in the home page query.
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
            }
          }
        }
      }
    }
  }
`;
