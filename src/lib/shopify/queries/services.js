// Services page content. Same shape as the home page: a `content` metaobject
// (handle "services") whose component slots each hold a section reference, so
// the order of the slots is the order the page renders in. Section field
// selections come from each section component's colocated fragment (see
// queries/home.js for the pattern).
//
// This query aliases the live field keys onto component1/component2 — the admin
// labels them "Component 1"/"Component 2", but the API keys are historical
// (`sections`, `section_2`, …) and are never renamed. The aliases are the one
// place render order lives.
//
// The slot keys are shared with the `content` definition's home entry, so the
// historical key names here match home's.
import { heroSectionFragment } from '@/components/sections/HeroSection/HeroSection';
import { bannerSectionFragment } from '@/components/sections/BannerSection/BannerSection';

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

  # A slot holds either a single section reference or a list of them, so both
  # shapes are selected and the page normalizes them.
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
