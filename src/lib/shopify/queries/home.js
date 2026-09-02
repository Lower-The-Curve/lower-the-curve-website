import { heroSectionFragment } from '@/components/sections/HeroSection/HeroSection';
import { partnersSectionFragment } from '@/components/sections/PartnersSection/PartnersSection';
import { solutionsSectionFragment } from '@/components/sections/SolutionsSection/SolutionsSection';
import { testimonialsSectionFragment } from '@/components/sections/TestimonialsSection/testimonials.shared';
import { caseStudiesSectionFragment } from '@/components/sections/CaseStudiesSection/CaseStudiesSection';

// Home page content. The `content` metaobject (handle "home") has one reference
// field per component slot, and the ORDER OF THOSE SLOTS is the order the page
// renders in — Component 1 first, Component 5 last.
//
// WHY THE KEYS DON'T MATCH THEIR LABELS
// The admin labels the slots "Component 1" … "Component 5", but Shopify never
// renames a field's API key when its display name changes, so the live keys are
// still the historical `sections`, `section_2`, `component_3`, … That mismatch
// is exactly why the slots are aliased to component1…component5 below rather
// than read off the metaobject's `fields` array: `fields` comes back sorted
// ALPHABETICALLY (component_3, page_name, section_2, sections), which is not the
// authored order and would render the page in the wrong sequence.
//
// So this list is the single place the page's component order is declared. To
// add a sixth slot, add the field in the admin and add one aliased line here.
//
// Section field selections are NOT hardcoded here — each section component
// contributes its own colocated fragment, and all of them are spread onto every
// slot, so any component type can go in any slot. Add a new section type by
// importing its fragment and spreading it alongside the others.
//
// Note: the Storefront API uses `metaobject(handle: ...)`. (`metaobjectByHandle`
// only exists in the Admin API.)
export const getHomePageQuery = /* GraphQL */ `
  query GetHomePage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      component1: field(key: "sections") {
        ...PageComponentFields
      }
      component2: field(key: "section_2") {
        ...PageComponentFields
      }
      component3: field(key: "component_3") {
        ...PageComponentFields
      }
      component4: field(key: "component_4") {
        ...PageComponentFields
      }
      component5: field(key: "component_5") {
        ...PageComponentFields
      }
    }
  }

  # A slot holds either a single section reference or a list of them, so both
  # shapes are selected and the page normalizes them. An empty slot — or a key
  # that doesn't exist on the definition at all — simply comes back null.
  fragment PageComponentFields on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ...HeroSectionFields
      ...PartnersSectionFields
      ...SolutionsSectionFields
      ...CaseStudiesSectionFields
    }
    references(first: 20) {
      nodes {
        __typename
        ...HeroSectionFields
        ...PartnersSectionFields
        ...SolutionsSectionFields
        ...CaseStudiesSectionFields
      }
    }
  }
  ${heroSectionFragment}
  ${partnersSectionFragment}
  ${solutionsSectionFragment}
  ${caseStudiesSectionFragment}
`;
