// Fragment for the `team` metaobject that TeamSection renders. Its
// `team_members` field is a list of `team_member` entries (name, role, photo),
// and `green_glow` is a file reference, so both resolve through this one
// selection and the page query only spreads the fragment.
export const teamSectionFragment = /* GraphQL */ `
  fragment TeamSectionFields on Metaobject {
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
      # first: 50 must match every other section fragment spread into the same
      # page query that selects the references field on a MetaobjectField.
      # GraphQL merges same-typed selections and rejects differing arguments
      # (see the note in banner.js).
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
