// Fragment for the `case_study_approach` metaobject that PartnerApproachSection renders.
// Two levels: the section's `steps` reference list, then each step's `icon`
// (a MediaImage). Live keys are listed in PartnerApproachSection.js.
//
// It is spread inside partnerDetailSectionFragment's `references` nodes, because
// the entry is reached through the partner_detail entry's `case_study_approach`
// list field rather than fetched by type.
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

// Fragment for the shared `approach` metaobject: the section's heading and
// intro, which are the same for every partner (title, description, and the
// green_glow decoration, a MediaImage). The
// per-partner steps come from partnerApproachSectionFragment above.
export const partnerApproachIntroFragment = /* GraphQL */ `
  fragment PartnerApproachIntroFields on Metaobject {
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
`;
