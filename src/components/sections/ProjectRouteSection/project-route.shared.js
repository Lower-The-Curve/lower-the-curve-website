// Type + fragment live apart from the client tabs file because the page QUERY
// imports the fragment. A server-side query module must not pull a client
// module into its graph.
//
// Live Admin / Storefront keys (verified in Postman):
//   project_route       title, description, steps
//   project_route_step  title, cards
//   project_route_card  title, description, icon (file_reference → MediaImage)
//
// The fragment nests TWO reference lists. One level returns tab titles and
// empty cards.
export const PROJECT_ROUTE_TYPE = "project_route";

export const projectRouteSectionFragment = /* GraphQL */ `
  fragment ProjectRouteSectionFields on Metaobject {
    id
    handle
    type
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
