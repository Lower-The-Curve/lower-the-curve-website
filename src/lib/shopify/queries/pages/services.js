import {
  heroSectionFragment,
  bannerSectionFragment,
} from '../sections';

// Services page content. Same shape as the home page: a `content` metaobject
// (handle "services") with a `sections` field whose reference(s) are the
// individual section metaobjects. Section field selections come from each
// section's fragment in ../sections (see home.js for the pattern).
export const getServicesPageQuery = /* GraphQL */ `
  query GetServicesPage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      component1: field(key: "sections") {
        ...ServicesComponentFields
      }
      component2: field(key: "section_2") {
        ...ServicesComponentFields
      }
    }
  }

  fragment ServicesComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...HeroSectionFields
      ...BannerSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...HeroSectionFields
        ...BannerSectionFields
      }
    }
  }
  ${heroSectionFragment}
  ${bannerSectionFragment}
`;
