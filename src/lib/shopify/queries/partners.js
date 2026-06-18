import { partnersSectionFragment } from '@/components/sections/PartnersSection/PartnersSection';

// The partners section is a single `partners` metaobject holding a `title` and
// a `partner_item` list of partner entries. Fetched as one section metaobject.
export const getPartnersQuery = /* GraphQL */ `
  query GetPartners($first: Int!) {
    metaobjects(type: "partners", first: $first) {
      edges {
        node {
          ...PartnersSectionFields
        }
      }
    }
  }
  ${partnersSectionFragment}
`;
