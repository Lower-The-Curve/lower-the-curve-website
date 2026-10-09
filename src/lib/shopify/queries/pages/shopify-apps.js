import { heroSectionFragment, projectRouteSectionFragment } from '../sections';

// Shopify Apps page content. Same pattern as home: a `content` metaobject
// (handle "shopify-apps") with one reference field per component slot. The
// ORDER OF THOSE SLOTS is the order the page renders in.
//
// Live keys are `sections` and `section_2`. `component2` is only an alias for
// the underscore key (the admin's "Component 2"), the same pattern as home.
// Render order is this list, not the `fields` array.
//
// Section field selections come from each section's fragment in ../sections.
export const getShopifyAppsPageQuery = /* GraphQL */ `
  query GetShopifyAppsPage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      sections: field(key: "sections") {
        ...PageComponentFields
      }
      component2: field(key: "section_2") {
        ...PageComponentFields
      }
    }
  }

  fragment PageComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...HeroSectionFields
      ...ProjectRouteSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...HeroSectionFields
        ...ProjectRouteSectionFields
      }
    }
  }
  ${heroSectionFragment}
  ${projectRouteSectionFragment}
`;
