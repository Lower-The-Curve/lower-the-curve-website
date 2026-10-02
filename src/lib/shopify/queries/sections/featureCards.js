// Fragment for the `feature_cards` metaobject that FeatureCardsSection renders.
// Its `cards` field is a list of `feature_card` entries (icon, title,
// description), and each card's icon file resolves through this one selection,
// so the page query stays generic — it only spreads the fragment.
export const featureCardsSectionFragment = /* GraphQL */ `
  fragment FeatureCardsSectionFields on Metaobject {
    id
    handle
    type
    fields {
      key
      type
      value
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
                # An SVG upload can come back as a GenericFile rather than a
                # MediaImage, so both are selected.
                ... on GenericFile {
                  url
                  alt
                }
              }
            }
          }
        }
      }
    }
  }
`;
