import {
  heroSectionFragment,
  projectRouteSectionFragment,
  richTextWithStatsSectionFragment,
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
      sections: field(key: "sections") {
        key
        value
        reference {
          __typename
          ...HeroSectionFields
          ...ProjectRouteSectionFields
          ...RichTextWithStatsSectionFields
        }
        references(first: 20) {
          nodes {
            __typename
            ...HeroSectionFields
            ...ProjectRouteSectionFields
            ...RichTextWithStatsSectionFields
          }
        }
      }
      component6: field(key: "component_6") {
        key
        value
        reference {
          __typename
          ...HeroSectionFields
          ...ProjectRouteSectionFields
          ...RichTextWithStatsSectionFields
        }
        references(first: 20) {
          nodes {
            __typename
            ...HeroSectionFields
            ...ProjectRouteSectionFields
            ...RichTextWithStatsSectionFields
          }
        }
      }
    }
  }
  ${heroSectionFragment}
  ${projectRouteSectionFragment}
  ${richTextWithStatsSectionFragment}
`;
