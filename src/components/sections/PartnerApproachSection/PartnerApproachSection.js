import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import './PartnerApproachSection.css';

// The partner case-study approach timeline. It reads two metaobjects:
//
//   `approach` (the `intro` prop) is shared by every partner, because the
//   heading and intro never change:
//     - `title`       : single_line_text_field, the centred heading (accent
//                       markup — see accentedTitle).
//     - `description` : multi_line_text_field, the centred intro.
//     - `green_glow`  : file_reference -> MediaImage, a decorative glow at the
//                       section's top-left that also bleeds up into the section
//                       above.
//
//   `case_study_approach` (the `section` prop) is per partner, reached through
//   the partner's `partner_detail` entry (its `case_study_approach` list, first
//   entry):
//     - `title` : the merchant-facing label ("Blackroll Approach"). NOT rendered.
//     - `steps` : list.metaobject_reference -> `approach_step`. The list's
//                 order is the render order, and there is no maximum.
//
// Nested type (read through the reference list, not dispatched on):
//   approach_step  icon (file_reference -> MediaImage, the finished round icon),
//                  week_range, title, description
//
// The step number ("01", "02"…) is generated from the order, never stored.
//
// Fragments live in lib/shopify/queries/sections/partnerApproach.js.
export const PARTNER_APPROACH_TYPE = 'case_study_approach';

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

export default function PartnerApproachSection({ section, intro }) {
  if (!section) return null;

  const title = fieldValue(intro, 'title');
  const description = fieldValue(intro, 'description');
  const steps = stepsFrom(section);
  const glow = field(intro, 'green_glow')?.reference?.image ?? null;

  if (!title && !description && !steps.length) return null;

  return (
    <section className="partner-approach">
      {glow && (
        <Image
          src={glow.url}
          alt=""
          width={glow.width ?? 300}
          height={glow.height ?? 300}
          className="partner-approach__glow"
          aria-hidden="true"
          unoptimized
        />
      )}
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
          // The scroller lets the row swipe on narrow screens. The step count
          // drives the grid and the line's ring mask, so the line and the cards
          // stay aligned for 3 steps or 5 with no layout change.
          <div className="partner-approach__scroller">
            <div
              className="partner-approach__track"
              style={{ '--partner-approach-steps': steps.length }}
            >
              <span className="partner-approach__line" aria-hidden="true" />

              <ol className="partner-approach__list">
                {steps.map((step, index) => (
                  <li key={step.id} className="partner-approach__item">
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
