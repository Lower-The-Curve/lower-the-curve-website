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
