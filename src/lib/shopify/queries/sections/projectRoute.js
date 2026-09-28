// Fragment for the `project_route` metaobject that ProjectRouteSection renders.
// The fragment nests TWO reference lists. One level returns tab titles and
// empty cards. Live keys are listed in ProjectRouteSection.js.
export const projectRouteSectionFragment = /* GraphQL */ `
  fragment ProjectRouteSectionFields on Metaobject {
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
        ... on GenericFile {
          url
          alt
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
        }
      }
    }
  }
`;
