import {
  partnerApproachIntroFragment,
  partnerApproachSectionFragment,
  caseStudyMetricsSectionFragment,
  partnerDetailSectionFragment,
  partnerDetailResultsSectionFragment,
  partnerDetailProblemSectionFragment,
  deliveredSectionFragment,
  deliveredCardFragment,
  partnerTestimonialSectionFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields
        ...CaseStudyMetricsSectionFields

        results: field(key: "results") {
          reference {
            __typename
            ...PartnerDetailResultsSectionFields
          }
        }

        problem: field(key: "problem") {
          reference {
            __typename
            ...PartnerDetailProblemSectionFields
          }
        }
<<<<<<< Updated upstream

        exploreMore: field(key: "explore_more") {
          reference {
            __typename
            ...DeliveredSectionFields
          }
        }

        exploreMore: field(key: "explore_more") {
          reference {
            __typename
            ...PartnerDetailExploreMoreSectionFields
          }
        }
      }
    }

    # Every Delivered Card, for Explore More to pick from. Fetched by type so
    # no card is hand-picked; the section drops the current partner's own card.
    exploreMoreCards: metaobjects(type: "delivered_card", first: 50) {
      nodes {
        ...PartnerDetailExploreMoreCardFields
=======
>>>>>>> Stashed changes
      }
    }

    # All Delivered Cards, for Latest / Random.
    deliveredCards: metaobjects(type: "delivered_card", first: 50) {
      nodes {
        ...DeliveredCardFields
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${partnerDetailResultsSectionFragment}
  ${partnerApproachSectionFragment}
  ${caseStudyMetricsSectionFragment}
  ${partnerDetailProblemSectionFragment}
  ${deliveredSectionFragment}
  ${deliveredCardFragment}
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
