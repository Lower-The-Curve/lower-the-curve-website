import { heroSectionFragment, projectRouteSectionFragment } from '../sections';

// Shopify Apps page content. Same pattern as home: a `content` metaobject
// (handle "shopify-apps") with one reference field per component slot. The
// ORDER OF THOSE SLOTS is the order the page renders in.
//
// Live keys are `sections`, `section_2` and `component_3`. `component2` is
// only an alias for the underscore key (the admin's "Component 2"), the same
// pattern as home. Render order is this list, not the `fields` array.
//
// `component_6` is deliberately NOT queried: it is a legacy slot that still
// references the same "Copy of How we get things Done" entry as `component_3`,
// so selecting it would render the process section twice. Clear that slot in
// the admin when convenient; add it here once it holds a different section.
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
      component3: field(key: "component_3") {
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
