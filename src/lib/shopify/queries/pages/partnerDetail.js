import {
  partnerDetailSectionFragment,
  partnerDetailExploreMoreSectionFragment,
  partnerDetailExploreMoreCardFragment,
  whatWeBuiltSectionFragment,
} from '../sections';

export const getPartnerDetailPageQuery = /* GraphQL */ `
  query GetPartnerDetailPage($first: Int!) {
    metaobjects(type: "partner_detail", first: $first) {
      nodes {
        ...PartnerDetailSectionFields

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
      }
    }
  }
  ${partnerDetailSectionFragment}
  ${partnerDetailExploreMoreSectionFragment}
  ${partnerDetailExploreMoreCardFragment}
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
