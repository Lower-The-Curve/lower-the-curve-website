import { partnerFragment } from '@/components/sections/PartnersSection/PartnersSection';

// Partners are a collection of `partners` metaobjects (each an individual
// partner with a logo). Fetched as a set rather than via a page's `sections`.
export const getPartnersQuery = /* GraphQL */ `
  query GetPartners($first: Int!) {
    metaobjects(type: "partners", first: $first) {
      edges {
        node {
          ...PartnerFields
        }
      }
    }
  }
  ${partnerFragment}
`;
