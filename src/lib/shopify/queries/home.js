import { heroSectionFragment } from '@/components/sections/HeroSection/HeroSection';

// Home page content. The `content` metaobject (handle "home") has a `sections`
// field whose reference(s) are the individual section metaobjects.
//
// Section field selections are NOT hardcoded here — each section component
// contributes its own colocated fragment (e.g. `HeroSectionFields`), which is
// spread onto the section reference(s) and appended below. Add a new section
// type by importing its fragment and spreading it alongside the others.
//
// Note: the Storefront API uses `metaobject(handle: ...)`. (`metaobjectByHandle`
// only exists in the Admin API.)
export const getHomePageQuery = /* GraphQL */ `
  query GetHomePage($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      sections: field(key: "sections") {
        key
        value
        reference {
          __typename
          ...HeroSectionFields
        }
        references(first: 20) {
          nodes {
            __typename
            ...HeroSectionFields
          }
        }
      }
    }
  }
  ${heroSectionFragment}
`;
