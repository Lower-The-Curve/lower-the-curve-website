import { partnerDetailSectionFragment } from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields
      }
    }
  }
  ${partnerDetailSectionFragment}
`;
