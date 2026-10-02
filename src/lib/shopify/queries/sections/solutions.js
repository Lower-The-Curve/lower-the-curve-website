// Fragment for the `solutions` metaobject that SolutionsSection renders. Both
// reference lists (`solution`, `stats`) and the icon behind each solution item
// resolve through this one selection, so the page query stays generic — it only
// spreads the fragment.
export const solutionsSectionFragment = /* GraphQL */ `
  fragment SolutionsSectionFields on Metaobject {
    id
    handle
    type
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
              }
            }
          }
        }
      }
    }
  }
`;
