// Fragment for the `approach` metaobject that PartnerApproachSection renders.
// Two levels: the section's `steps` reference list, then each step's `icon`
// (a MediaImage). Live keys are listed in PartnerApproachSection.js.
//
// It is spread inside partnerDetailSectionFragment's `reference`, because the
// approach entry is reached through the partner_detail entry's `approach`
// field rather than fetched by type.
export const partnerApproachSectionFragment = /* GraphQL */ `
  fragment PartnerApproachSectionFields on Metaobject {
    id
    type
    handle
    fields {
      key
      type
      value
      # first: 50 must match the other section fragments that select the
      # references field on a MetaobjectField (see partnerDetail.js).
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
