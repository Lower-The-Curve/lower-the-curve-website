
export const statsGridSectionFragment = `
  fragment StatsGridSectionFields on Metaobject {
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
            }
          }
        }
      }
    }
  }
`;
