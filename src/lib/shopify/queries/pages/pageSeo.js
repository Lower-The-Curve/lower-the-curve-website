export const pageSeoFragment = /* GraphQL */ `
  fragment PageSeoFields on Metaobject {
    updatedAt
    pageName: field(key: "page_name") {
      value
    }
    seoTitle: field(key: "seo_title") {
      value
    }
    seoDescription: field(key: "seo_description") {
      value
    }
    seoImage: field(key: "seo_image") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;
