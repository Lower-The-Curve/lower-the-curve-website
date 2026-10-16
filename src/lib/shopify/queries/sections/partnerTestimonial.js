export const partnerTestimonialSectionFragment = `
  fragment PartnerTestimonialSectionFields on Metaobject {
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
