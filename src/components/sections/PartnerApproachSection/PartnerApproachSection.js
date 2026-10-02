import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import './PartnerApproachSection.css';

// The partner case-study approach timeline. It reads a single `approach`
// metaobject, reached through the partner's `partner_detail` entry (its
// `approach` field), so every partner gets its own copy and steps:
//   - `title`       : single_line_text_field, the centred heading (accent
//                     markup — see accentedTitle).
//   - `description` : multi_line_text_field, the centred intro.
//   - `steps`       : list.metaobject_reference -> `approach_step`. The list's
//                     order is the render order, and there is no maximum.
//
// Nested type (read through the reference list, not dispatched on):
//   approach_step  icon (file_reference -> MediaImage, the finished round icon),
//                  week_range, title, description
//
// The step number ("01", "02"…) is generated from the order, never stored.
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/partnerApproach.js.
export const PARTNER_APPROACH_TYPE = 'approach';

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

function stepsFrom(section) {
  const nodes = field(section, 'steps')?.references?.nodes ?? [];

  return nodes
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      icon: field(node, 'icon')?.reference?.image ?? null,
      weekRange: fieldValue(node, 'week_range'),
      title: fieldValue(node, 'title'),
      description: fieldValue(node, 'description'),
    }))
    .filter((step) => step.title || step.description);
}

function stepNumber(index) {
  return String(index + 1).padStart(2, '0');
}

export default function PartnerApproachSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description');
  const steps = stepsFrom(section);

  if (!title && !description && !steps.length) return null;

  return (
    <section className="partner-approach">
      <div className="partner-approach__inner">
        {(title || description) && (
          <div className="partner-approach__intro">
            {title && (
              <h2 className="partner-approach__title">
                {accentedTitle(title, {
                  accent: 'partner-approach__accent',
                  blue: 'partner-approach__accent--blue',
                  green: 'partner-approach__accent--green',
                })}
              </h2>
            )}
            {description && (
              <p className="partner-approach__lede">{description}</p>
            )}
          </div>
        )}

        {steps.length > 0 && (
          // The step count drives the desktop grid, so the line and the card
          // row stay aligned for 3 steps or 5 with no layout change.
          <ol
            className="partner-approach__list"
            style={{ '--partner-approach-steps': steps.length }}
          >
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={[
                  'partner-approach__item',
                  index === 0 ? 'partner-approach__item--first' : '',
                  index === steps.length - 1
                    ? 'partner-approach__item--last'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="partner-approach__marker">
                  {step.icon && (
                    <Image
                      src={step.icon.url}
                      alt={step.icon.altText ?? ''}
                      width={step.icon.width ?? 60}
                      height={step.icon.height ?? 60}
                      className="partner-approach__icon"
                      unoptimized
                    />
                  )}
                </div>

                <div className="partner-approach__card">
                  <span className="partner-approach__number">
                    {stepNumber(index)}
                  </span>
                  {step.weekRange && (
                    <span className="partner-approach__pill">
                      {step.weekRange}
                    </span>
                  )}
                  {step.title && (
                    <h3 className="partner-approach__step-title">
                      {step.title}
                    </h3>
                  )}
                  {step.description && (
                    <p className="partner-approach__step-copy">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
