import './CaseStudyMetricsSection.css';

// The partner "How key metrics moved" section. It reads two metaobjects, both
// fetched in lib/shopify/index.js — `section` by getCaseStudyMetrics(), `partner`
// (the partner_detail node) by getPartnerDetailPage():
//   case_study_metrics (`section`) — the copy shared by every partner:
//     - `title`    : single_line_text_field.
//     - `subtitle` : single_line_text_field, stored as
//                    `<span class="blue-gradient">Before/After</span>`; tags
//                    are stripped here and the accent is painted by the theme.
//   partner_detail (`partner`) — the partner's own entry:
//     - `partner_metric` : list.metaobject_reference -> `partner_metrics`, whose
//                          `metrics` field is list.metaobject_reference ->
//                          `metric` entries. The list's order is the render
//                          order.
//
// Nested type (read through the reference list, not dispatched on):
//   metric  name, before_value, after_value (display text, "3.8s"),
//           before_percent, after_percent (0-100 bar lengths)
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/caseStudyMetrics.js.
//
// Each row is a card (name, struck-through before > after) beside a pair of
// bars on a 0-100% grid. The longer of the two is the solid bar and the shorter
// the faded one overlaid on it, so the pair reads the same whichever direction
// the metric moved (a lower-is-better metric has before > after).
export const CASE_STUDY_METRICS_TYPE = 'case_study_metrics';

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

function fieldValue(node, ...keys) {
  for (const key of keys) {
    const value = field(node, key)?.value;

    if (value) return value;
  }

  return null;
}

function stripTags(text) {
  return text.replace(/<[^>]*>/g, '');
}

const SCALE = [0, 25, 50, 75, 100];

// Bar lengths are authored 0-100; clamp so a stray value can't overflow the track.
function percent(value) {
  return Math.min(100, Math.max(0, parseFloat(value) || 0));
}

function metricsFrom(partner) {
  const group = field(partner, 'partner_metric')?.references?.nodes?.[0];
  const nodes = field(group, 'metrics')?.references?.nodes ?? [];

  return nodes
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      name: fieldValue(node, 'name'),
      beforeValue: fieldValue(node, 'before_value'),
      afterValue: fieldValue(node, 'after_value'),
      beforePercent: fieldValue(node, 'before_percent'),
      afterPercent: fieldValue(node, 'after_percent'),
    }))
    .filter((metric) => metric.name);
}

export default function CaseStudyMetricsSection({ section, partner }) {
  if (!section || !partner) return null;

  const title = fieldValue(section, 'title');
  const subtitle = fieldValue(section, 'subtitle');
  const metrics = metricsFrom(partner);

  if (!metrics.length) return null;

  return (
    <section className="case-study-metrics">
      <div className="case-study-metrics__inner">
        {title && <h2 className="case-study-metrics__title">{title}</h2>}
        {subtitle && (
          <p className="case-study-metrics__subtitle">{stripTags(subtitle)}</p>
        )}

        <div className="case-study-metrics__chart">
          <div className="case-study-metrics__grid" aria-hidden="true" />

          <ul className="case-study-metrics__list">
            {metrics.map((metric) => (
              <li key={metric.id} className="case-study-metrics__row">
                <div className="case-study-metrics__card">
                  <span className="case-study-metrics__name">{metric.name}</span>
                  <span className="case-study-metrics__change">
                    <s className="case-study-metrics__before">
                      {metric.beforeValue}
                    </s>
                    <span className="case-study-metrics__arrow" />
                    <span className="case-study-metrics__after">
                      {metric.afterValue}
                    </span>
                  </span>
                </div>

                <div className="case-study-metrics__track" aria-hidden="true">
                  {[metric.afterPercent, metric.beforePercent]
                    .map(percent)
                    .sort((x, y) => y - x)
                    .map((width, i) => (
                      <span
                        key={i}
                        className={`case-study-metrics__bar ${i ? 'case-study-metrics__bar--fade' : 'case-study-metrics__bar--solid'}`}
                        style={{ width: `${width}%` }}
                      />
                    ))}
                </div>
              </li>
            ))}
          </ul>

          <ol className="case-study-metrics__scale" aria-hidden="true">
            {SCALE.map((tick) => (
              <li key={tick}>{tick}%</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
