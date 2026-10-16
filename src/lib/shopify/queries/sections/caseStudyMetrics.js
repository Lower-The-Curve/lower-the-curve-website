// Spread onto two different entries:
//   - the shared `case_study_metrics` entry (title, subtitle), in
//     getCaseStudyMetricsQuery, and
//   - every `partner_detail` node in getPartnerDetailPageQuery, to reach
//     partner_metric -> metrics -> rows, a chain the partner detail fragment
//     stops short of.
// first: 50 must match the other section fragments that select `references` on
// a MetaobjectField (see partnerDetail.js) — GraphQL rejects differing
// arguments on merged selections.
export const caseStudyMetricsSectionFragment = /* GraphQL */ `
  fragment CaseStudyMetricsSectionFields on Metaobject {
    id
    type
    handle
    fields {
      key
      type
      value
      references(first: 50) {
        nodes {
          ... on Metaobject {
            id
            type
            handle
            fields {
              key
              type
              value
              references(first: 50) {
                nodes {
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
        }
      }
    }
  }
`;
