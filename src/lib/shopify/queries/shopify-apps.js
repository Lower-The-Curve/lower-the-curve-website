import { heroSectionFragment } from "@/components/sections/HeroSection/HeroSection";
import { projectRouteSectionFragment } from "@/components/sections/ProjectRouteSection/ProjectRouteSection";

// Shopify Apps page content. Same shape as services: a `content` metaobject
// (handle "shopify-apps") with the same component slots. Hero can be empty;
// Project Route lives on component_6.
export const getShopifyAppsPageQuery = /* GraphQL */ `
  query GetShopifyAppsPage($handle: MetaobjectHandleInput!) {
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
        }
        references(first: 20) {
          nodes {
            __typename
            ...HeroSectionFields
            ...ProjectRouteSectionFields
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
        }
        references(first: 20) {
          nodes {
            __typename
            ...HeroSectionFields
            ...ProjectRouteSectionFields
          }
        }
      }
    }
  }
  ${heroSectionFragment}
  ${projectRouteSectionFragment}
`;
