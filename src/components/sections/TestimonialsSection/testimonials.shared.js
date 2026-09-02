// Type + fragment live apart from the component because the component is a
// Client Component ('use client') and the page QUERY imports the fragment. A
// server-side query module must not pull a client module into its graph, so the
// two shared constants sit in this plain module that either side can import.
//
// The testimonials section is a single metaobject with:
//   - `title`        : single_line_text_field, the heading (accent markup)
//   - `description`  : multi_line_text_field, the lede
//   - `testimonial`  : list.metaobject_reference -> the cards, each carrying
//                      `description` (the quotation), `name`, `company` and
//                      `company_logo` (the mark that seats in the card's notch).
//
// MIND THE SPELLING. The live definition's API identifier is `testimonails`, not
// `testimonials` — the "ai" is transposed. (Its items are `teestimonial`, with a
// doubled e, but that never has to be matched: the cards are read through the
// reference list, not by type.) Shopify fixes an API identifier at creation and
// does not rename it with the display name, so this typo is the real key until
// the definition is recreated.
//
// Both spellings are exported and both are dispatched on, so correcting it later
// cannot silently blank the section out.
export const TESTIMONIALS_TYPE = 'testimonails';
export const TESTIMONIALS_TYPE_CORRECTED = 'testimonials';

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
