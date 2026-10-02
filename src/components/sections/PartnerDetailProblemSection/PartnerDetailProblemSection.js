import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import ArrowIcon from '@/components/ui/Button/ArrowIcon';
import BlueDot from '@/components/sections/SolutionsSection/BlueDot';
import './PartnerDetailProblemSection.css';

// The partner's "problem" section, right under the partner hero. It reads a
// single `partner_detail_problem` metaobject, reached through the `problem`
// reference on the page's `partner_detail` entry (never fetched on its own):
//   - `title`       : single_line_text_field, "What we did for {partner}?".
//                     `{partner}` is replaced with the partner's name from the
//                     same `partner_detail` entry, so one text serves every
//                     partner. Accent markup is parsed by accentedTitle.
//   - `subtitle`    : single_line_text_field, the second heading (accent
//                     markup, same size as the title).
//   - `description` : multi_line_text_field; blank lines split it into
//                     paragraphs.
//   - `issue_label` : single_line_text_field, the word in front of each row's
//                     number ("Issue" -> "Issue 1 - "). Empty means the row
//                     shows its title alone. The number is the row's position
//                     in `issues`, never stored.
//   - `issues`      : list.metaobject_reference -> `problem_issue`. The list's
//                     order is the render order, and there is no maximum.
//   - `show_arrows` : boolean. ABSENT means shown (same rule as Banner's
//                     show_* toggles), so it has to be set to false to hide.
//
// Nested type (read through the reference list, not dispatched on):
//   problem_issue  icon (file_reference, an uploaded SVG that already carries
//                  its blue rounded tile — nothing is drawn behind it), title,
//                  url (url, the issue's own page)
//
// show_arrows alone decides whether the arrows show. A row becomes a link
// only when the issue also has a url, so arrows can be switched on before the
// issue pages exist.
//
// Order in the DOM is title, description, subtitle, issues: the mobile order,
// so each heading sits right above its own content. Desktop places them in two
// columns with grid areas (see the CSS).
//
// Its GraphQL fragment lives in
// lib/shopify/queries/sections/partnerDetailProblem.js.
export const PARTNER_DETAIL_PROBLEM_TYPE = 'partner_detail_problem';

const PARTNER_TOKEN = /\{partner\}/gi;

const ACCENT_CLASSES = {
  accent: 'partner-detail-problem__accent',
  blue: 'partner-detail-problem__accent--blue',
  green: 'partner-detail-problem__accent--green',
};

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

function toggledOn(node, ...keys) {
  return fieldValue(node, ...keys) !== 'false';
}

function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// Icons resolve as a MediaImage, or as a GenericFile (url only) for some SVGs.
function iconFrom(node, ...keys) {
  for (const key of keys) {
    const reference = field(node, key)?.reference;

    if (reference?.image?.url) return reference.image;
    if (reference?.url) return { url: reference.url };
  }

  return null;
}

// A `url` field holds a bare string, a `link` field JSON — accept both, so
// retyping the field in the admin needs no code change.
function urlFrom(node, ...keys) {
  const raw = fieldValue(node, ...keys);

  if (!raw) return null;

  try {
    return JSON.parse(raw)?.url || null;
  } catch {
    return raw;
  }
}

// The partner's display name, from the `partner` entry that the page's
// `partner_detail` entry points at — the same name the hero shows. The page
// passes it in as `partnerName` to fill `{partner}` in the headings.
export function partnerNameOf(partnerDetail) {
  return fieldValue(field(partnerDetail, 'name')?.reference, 'name');
}

function withPartner(text, partnerName) {
  return text.replace(PARTNER_TOKEN, partnerName ?? '');
}

function issueItems(section) {
  // `issue` is accepted too: the list field was briefly re-created under that
  // key in the admin, and a key can't be renamed after creation.
  const list = field(section, 'issues') ?? field(section, 'issue');
  const nodes = list?.references?.nodes ?? [];

  return nodes
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      title: fieldValue(node, 'title'),
      icon: iconFrom(node, 'icon'),
      url: urlFrom(node, 'url', 'link'),
    }))
    .filter((issue) => issue.title);
}

export default function PartnerDetailProblemSection({ section, partnerName }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const subtitle = fieldValue(section, 'subtitle');
  const description = paragraphs(fieldValue(section, 'description') ?? '');
  const issueLabel = fieldValue(section, 'issue_label')?.trim();
  const showArrows = toggledOn(section, 'show_arrows');
  const issues = issueItems(section);

  if (!title && !subtitle && !description.length && !issues.length) {
    return null;
  }

  return (
    <section className="partner-detail-problem">
      <span className="partner-detail-problem__sphere" aria-hidden="true" />

      <div className="partner-detail-problem__inner">
        {title && (
          <h2 className="partner-detail-problem__title">
            {accentedTitle(withPartner(title, partnerName), ACCENT_CLASSES)}
          </h2>
        )}

        {description.length > 0 && (
          <div className="partner-detail-problem__description">
            {description.map((text, i) => (
              <p key={i} className="partner-detail-problem__paragraph">
                {text}
              </p>
            ))}
          </div>
        )}

        {subtitle && (
          <h2 className="partner-detail-problem__subtitle">
            {accentedTitle(withPartner(subtitle, partnerName), ACCENT_CLASSES)}
          </h2>
        )}

        {issues.length > 0 && (
          <div className="partner-detail-problem__issues">
            <BlueDot className="partner-detail-problem__blue-dot" />

            <ol className="partner-detail-problem__list">
              {issues.map((issue, index) => {
                const linked = Boolean(issue.url);
                const Row = linked ? 'a' : 'div';
                const label = issueLabel
                  ? `${issueLabel} ${index + 1} - ${issue.title}`
                  : issue.title;

                return (
                  <li key={issue.id} className="partner-detail-problem__item">
                    <Row
                      className={`partner-detail-problem__row${
                        linked ? ' partner-detail-problem__row--link' : ''
                      }`}
                      href={linked ? issue.url : undefined}
                    >
                      <span className="partner-detail-problem__tile">
                        {/* Decorative: the label beside it names the issue. */}
                        {issue.icon && (
                          <Image
                            src={issue.icon.url}
                            alt=""
                            width={issue.icon.width ?? 75}
                            height={issue.icon.height ?? 75}
                            className="partner-detail-problem__icon"
                            unoptimized={/\.svg(\?|$)/i.test(issue.icon.url)}
                          />
                        )}
                      </span>

                      <span className="partner-detail-problem__label">
                        {label}
                      </span>

                      {showArrows && (
                        <ArrowIcon
                          gradient
                          className="partner-detail-problem__arrow"
                        />
                      )}
                    </Row>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
