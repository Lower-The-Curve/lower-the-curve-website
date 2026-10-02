// Fragment for the `hero_section` metaobject that HeroSection renders. The page
// queries spread it in, so adding/removing fields here is all that's required —
// the query stays generic.
//
// Metaobjects share the generic `Metaobject` type in the Storefront API, so the
// fragment selects the `fields` list and the component reads fields by key.
// Those fields are listed in HeroSection.js, beside the code that reads them.
export const heroSectionFragment = /* GraphQL */ `
  fragment HeroSectionFields on Metaobject {
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
