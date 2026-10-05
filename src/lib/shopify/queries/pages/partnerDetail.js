import {
  partnerDetailSectionFragment,
  partnerDetailResultsSectionFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields

        results: field(key: "results") {
          reference {
            __typename
            ...PartnerDetailResultsSectionFields
          }
        }
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${partnerDetailResultsSectionFragment}
`;

export const getWhatWeBuiltQuery = `
  query GetWhatWeBuilt {
    metaobjects(type: "what_we_built", first: 50) {
      nodes {
        ...WhatWeBuiltSectionFields
      }
    }
  }
  ${whatWeBuiltSectionFragment}
`;
