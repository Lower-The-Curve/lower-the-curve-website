// Fragment for the `case_studies` metaobject that CaseStudiesSection renders.
// Same shape as the other sections': the page query spreads this and hardcodes
// no field selections of its own.
export const caseStudiesSectionFragment = /* GraphQL */ `
  fragment CaseStudiesSectionFields on Metaobject {
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
    }
  }
`;
