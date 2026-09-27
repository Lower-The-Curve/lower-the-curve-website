// Fragment for the testimonials metaobject that TestimonialsSection renders. The
// `testimonial` reference list resolves here — each card's fields and its
// `company_logo` image — so the page query stays generic. The type constants,
// and the note on the definition's misspelled `testimonails` identifier, live in
// TestimonialsSection.js.
export const testimonialsSectionFragment = /* GraphQL */ `
  fragment TestimonialsSectionFields on Metaobject {
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
