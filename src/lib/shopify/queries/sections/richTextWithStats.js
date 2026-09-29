
export const richTextWithStatsSectionFragment = `
  fragment RichTextWithStatsSectionFields on Metaobject {
    id
    handle
    type
    fields {
      key
      type
      value
      reference {
        __typename
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
      }
      references(first: 20) {
        nodes {
          __typename
          ... on Metaobject {
            id
            type
            handle
            fields {
              key
              type
              value
            }
          }
        }
      }
    }
  }
`;
