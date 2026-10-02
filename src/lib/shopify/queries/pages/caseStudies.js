import { bannerSectionFragment, deliveredSectionFragment } from '../sections';

// Case Studies page content. Same shape as the home and services pages: a
// `content` metaobject with one reference field per component slot, and the
// slot order IS the render order.
//
// The live entry's handle is `content-hcmnjrrd` — Shopify generated it from the
// page name ("Case Studies") when the entry was created. Renaming the handle in
// the admin is a one-line change in lib/shopify/index.js; the query itself
// takes it as a variable.
//
// The live keys don't match the admin's "Component N" labels (Shopify never
// renames a field's API key when its display name changes), so they are aliased
// to component1…component6 below — that aliased list is the single place render
// order lives. See home.js for the full explanation.
//
// Section field selections are not hardcoded here: the BannerSection fragment
// is spread onto every slot, so any slot can hold a banner.
export const getCaseStudiesPageQuery = /* GraphQL */ `
  query GetCaseStudiesPage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      component1: field(key: "sections") {
        ...CaseStudiesComponentFields
      }
      component2: field(key: "section_2") {
        ...CaseStudiesComponentFields
      }
      component3: field(key: "component_3") {
        ...CaseStudiesComponentFields
      }
      component4: field(key: "component_4") {
        ...CaseStudiesComponentFields
      }
      component5: field(key: "component_5") {
        ...CaseStudiesComponentFields
      }
      component6: field(key: "component_6") {
        ...CaseStudiesComponentFields
      }
    }
  }

  # A slot holds either a single reference or a list of them, so both shapes are
  # selected and the page normalizes them. An empty slot — or a key that doesn't
  # exist on the definition at all — simply comes back null.
  fragment CaseStudiesComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...BannerSectionFields
      ...DeliveredSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...BannerSectionFields
        ...DeliveredSectionFields
      }
    }
  }
  ${bannerSectionFragment}
  ${deliveredSectionFragment}
`;
