
export const partnerDetailSectionFragment = /* GraphQL */ `
  fragment PartnerDetailSectionFields on Metaobject {
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
      # first: 50 must match the other section fragments that select the
      # references field on a MetaobjectField (Solutions and Banner use 50).
      # GraphQL merges same-typed selections and rejects differing arguments —
      # a different number here would conflict with them in a shared query.
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
