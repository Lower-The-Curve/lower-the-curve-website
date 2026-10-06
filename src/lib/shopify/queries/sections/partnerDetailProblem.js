// Fragment for the `partner_detail_problem` metaobject that
// PartnerDetailProblemSection renders. It is not a slot in a `content` entry:
// the partner page reaches it through the `problem` reference on its
// `partner_detail` entry (see queries/pages/partnerDetail.js), so the hero and
// this section always come from the same entry.

export const partnerDetailProblemSectionFragment =  `
  fragment PartnerDetailProblemSectionFields on Metaobject {
    id
    type
    handle
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
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;
