import {
  partnerDetailSectionFragment,
  whatWeBuiltSectionFragment,
  partnerTestimonialSectionFragment,
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

// The live API identifier is `teestimonial` (doubled "e") — Shopify fixes an
// identifier at creation and does not rename it when the display name changes.
export const getPartnerTestimonialQuery = `
  query GetPartnerTestimonial {
    metaobjects(type: "teestimonial", first: 50) {
      nodes {
        ...PartnerTestimonialSectionFields
      }
    }
  }
  ${partnerTestimonialSectionFragment}
`;
