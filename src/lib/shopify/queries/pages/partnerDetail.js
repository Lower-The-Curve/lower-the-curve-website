import {
  caseStudyMetricsSectionFragment,
  partnerDetailSectionFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields
        ...CaseStudyMetricsSectionFields
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${caseStudyMetricsSectionFragment}
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

export const getCaseStudyMetricsQuery = `
  query GetCaseStudyMetrics {
    metaobjects(type: "case_study_metrics", first: 50) {
      nodes {
        ...CaseStudyMetricsSectionFields
      }
    }
  }
  ${caseStudyMetricsSectionFragment}
`;
