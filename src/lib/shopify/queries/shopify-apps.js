import { heroSectionFragment } from "@/components/sections/HeroSection/HeroSection";
import { projectRouteSectionFragment } from "@/components/sections/ProjectRouteSection/ProjectRouteSection";

// Shopify Apps page content. Same pattern as home: a `content` metaobject
// (handle "shopify-apps") with one reference field per component slot. The
// ORDER OF THOSE SLOTS is the order the page renders in.
//
// Live keys are `sections` and `component_6`. `component6` is only an alias
// for the underscore key. Render order is this list, not the `fields` array.
//
// Section field selections come from each section's colocated fragment.
export const getShopifyAppsPageQuery = /* GraphQL */ `
  query GetShopifyAppsPage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      sections: field(key: "sections") {
        ...PageComponentFields
      }
      component6: field(key: "component_6") {
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
