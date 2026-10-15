export const getAppPopUpsQuery = /* GraphQL */ `
  query GetAppPopUps($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
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
          references(first: 10) {
            nodes {
              __typename
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on Metaobject {
                id
                type
                handle
              }
            }
          }
        }
      }
    }
  }
`;
