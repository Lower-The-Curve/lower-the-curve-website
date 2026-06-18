import { heroSectionFragment } from '@/components/sections/HeroSection/HeroSection';

// Services page content. Same shape as the home page: a `content` metaobject
// (handle "services") with a `sections` field whose reference(s) are the
// individual section metaobjects. Section field selections come from each
// section component's colocated fragment (see queries/home.js for the pattern).
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
