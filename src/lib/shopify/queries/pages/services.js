import {
  heroSectionFragment,
  projectRouteSectionFragment,
  richTextWithStatsSectionFragment,
  solutionsSectionFragment,
  caseStudiesSectionFragment,
} from '../sections';

// Services page content. Same shape as the home and case-studies pages: a
// `content` metaobject (handle "services") with one reference field per
// component slot, and the slot order IS the render order.
//
// The live keys don't match the admin's "Component N" labels (Shopify never
// renames a field's API key when its display name changes), so they are aliased
// to component1…component6 below — that aliased list is the single place render
// order lives. See home.js for the full explanation.
//
// Section field selections are not hardcoded here: each section's fragment is
// spread onto every slot, so any component type can go in any slot.
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
      component3: field(key: "component_3") {
        ...ServicesComponentFields
      }
      component4: field(key: "component_4") {
        ...ServicesComponentFields
      }
      component5: field(key: "component_5") {
        ...ServicesComponentFields
      }
      component6: field(key: "component_6") {
        ...ServicesComponentFields
      }
    }
  }

  # A slot holds either a single reference or a list of them, so both shapes are
  # selected and the page normalizes them. An empty slot — or a key that doesn't
  # exist on the definition at all — simply comes back null.
  fragment ServicesComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...HeroSectionFields
      ...ProjectRouteSectionFields
      ...RichTextWithStatsSectionFields
      ...SolutionsSectionFields
      ...CaseStudiesSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...HeroSectionFields
        ...ProjectRouteSectionFields
        ...RichTextWithStatsSectionFields
        ...SolutionsSectionFields
        ...CaseStudiesSectionFields
      }
    }
  }
  ${heroSectionFragment}
  ${projectRouteSectionFragment}
  ${richTextWithStatsSectionFragment}
  ${solutionsSectionFragment}
  ${caseStudiesSectionFragment}
`;
