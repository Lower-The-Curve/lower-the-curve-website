import {
  partnerApproachIntroFragment,
  partnerApproachSectionFragment,
  partnerDetailSectionFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${partnerApproachSectionFragment}
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

// The shared heading and intro for the Approach section. There is one `approach`
// entry for every partner, so this takes the first.
export const getPartnerApproachIntroQuery = /* GraphQL */ `
  query GetPartnerApproachIntro {
    metaobjects(type: "approach", first: 1) {
      nodes {
        ...PartnerApproachIntroFields
      }
    }
  }
  ${partnerApproachIntroFragment}
`;
