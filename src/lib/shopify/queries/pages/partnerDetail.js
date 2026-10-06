import {
  partnerDetailSectionFragment,
  partnerDetailProblemSectionFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields

        problem: field(key: "problem") {
          reference {
            __typename
            ...PartnerDetailProblemSectionFields
          }
        }
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${partnerDetailProblemSectionFragment}
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
