import {
  heroSectionFragment,
  bannerSectionFragment,
  featureCardsSectionFragment,
  statsGridSectionFragment,
  teamSectionFragment,
} from '../sections';


export const getAboutUsPageQuery = `
  query GetAboutUsPage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      component1: field(key: "sections") {
        ...AboutUsComponentFields
      }
      component2: field(key: "section_2") {
        ...AboutUsComponentFields
      }
      component3: field(key: "component_3") {
        ...AboutUsComponentFields
      }
      component4: field(key: "component_4") {
        ...AboutUsComponentFields
      }
      component5: field(key: "component_5") {
        ...AboutUsComponentFields
      }
      component6: field(key: "component_6") {
        ...AboutUsComponentFields
      }
    }
  }

  # A slot can hold a single reference or a list.
  fragment AboutUsComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...HeroSectionFields
      ...BannerSectionFields
      ...FeatureCardsSectionFields
      ...StatsGridSectionFields
      ...TeamSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...HeroSectionFields
        ...BannerSectionFields
        ...FeatureCardsSectionFields
        ...StatsGridSectionFields
        ...TeamSectionFields
      }
    }
  }
  ${heroSectionFragment}
  ${bannerSectionFragment}
  ${featureCardsSectionFragment}
  ${statsGridSectionFragment}
  ${teamSectionFragment}
`;
