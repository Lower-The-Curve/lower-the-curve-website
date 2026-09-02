import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import SwooshBackdrop from './SwooshBackdrop';
import GreenCurveBackdrop from './GreenCurveBackdrop';
import BlueDot from './BlueDot';
import GreenGlow from './GreenGlow';
import accentedTitle from '@/components/ui/accentedTitle';
import './SolutionsSection.css';

// The solutions section is a single `solutions` metaobject with:
//   - `title`       : single_line_text_field, the section heading
//   - `description` : the lede under it — NOT on the live definition yet, so
//                     FALLBACK_DESCRIPTION below stands in. Several key names
//                     are accepted so whichever one gets created takes over.
//   - `solution`    : list.mixed_reference -> `solution` items, each with
//                     `title`, `description`, `image` (file_reference -> the
//                     line icon) and `button` (link -> { text, url }).
//   - `stats`       : list.mixed_reference -> `stats` items, each `value` +
//                     `description`.
//   - `use_stats`   : boolean, and it picks between TWO LAYOUTS, not just
//                     whether a card shows. See the note by `hasStats` below.
export const SOLUTIONS_TYPE = 'solutions';

// Colocated GraphQL fragment. Both reference lists (`solution`, `stats`) and the
// icon behind each solution item resolve through this one selection, so the page
// query stays generic — it only spreads the fragment.
export const solutionsSectionFragment = /* GraphQL */ `
  fragment SolutionsSectionFields on Metaobject {
    id
    handle
    type
    fields {
      key
      type
      value
      references(first: 50) {
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
            }
          }
        }
      }
    }
  }
`;

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

// First non-empty value across the given keys, so a rename in the Shopify admin
// doesn't blank the section out.
function fieldValue(node, ...keys) {
  for (const key of keys) {
    const value = field(node, key)?.value;
    if (value) return value;
  }
  return null;
}

// The resolved nodes of a reference list field, keyed by name rather than "the
// first field that happens to have references" — this metaobject has two lists.
function referencesFrom(node, ...keys) {
  for (const key of keys) {
    const nodes = field(node, key)?.references?.nodes;
    if (nodes?.length) return nodes;
  }
  return [];
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

// A `link` field's value is JSON: { "text": "Learn More", "url": "..." }. Tolerates
// the field being retyped to plain text in the admin (a bare URL), in which case
// there's no label — and a button with no label isn't rendered at all.
function linkFrom(node, ...keys) {
  const raw = fieldValue(node, ...keys);
  if (!raw) return null;

  try {
    const { text, url } = JSON.parse(raw);
    return text && url ? { text, url } : null;
  } catch {
    return null;
  }
}

// FALLBACK COPY. The `solutions` definition has no description field, and the
// Shopify Admin connector is unauthorized in this session, so the field can't be
// created from here — but the reference design has this paragraph under the
// heading, so it lives here until the field exists.
//
// It is a FALLBACK, not a default: add a `description` (or `paragraph` /
// `subtitle`) field in the admin and its value takes over with no code change.
// Delete this constant once it does — marketing copy belongs in the CMS.
const FALLBACK_DESCRIPTION =
  'We design, build, and scale Shopify experiences that convert. From ' +
  'powerful public apps to custom integrations, themes, and B2B solutions, ' +
  'we help brands move faster and sell smarter.';

// The design fixes the reading order of the four solutions, and the live CMS list
// is authored in the exact reverse of it. Pinning the order here was a deliberate
// call over reordering the list in the admin — see DESIGN-SYSTEM.md.
//
// TRAP: while this list exists, dragging the `solution` field's items in the
// Shopify admin has NO effect on the rendered order. Delete SOLUTION_ORDER (and
// the sort below) to hand ordering back to the CMS.
//
// A handle that isn't listed sorts AFTER every listed one and keeps its CMS
// position relative to the other unlisted ones, so adding a fifth solution in
// the admin appends it rather than dropping it.
const SOLUTION_ORDER = [
  'public-shopify-apps',
  'seamless-shopify-integrations',
  'theme-development',
  'b-2-b-functionalities',
];

function inDesignOrder(items) {
  const rank = ({ handle }) => {
    const index = SOLUTION_ORDER.indexOf(handle);
    return index === -1 ? SOLUTION_ORDER.length : index;
  };

  // Array.prototype.sort is stable, so unlisted handles keep their CMS order.
  return [...items].sort((a, b) => rank(a) - rank(b));
}

export default function SolutionsSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description =
    fieldValue(section, 'description', 'paragraph', 'subtitle') ??
    FALLBACK_DESCRIPTION;
  const solutions = inDesignOrder(
    referencesFrom(section, 'solution', 'solutions')
  );
  // `use_stats` selects between two layouts rather than just toggling a card:
  //
  //   true  -> split. Heading + lede + the blue stats card in a narrow left
  //            column, the solutions listed down a wider right column.
  //   false -> stacked. Heading + lede centred across the full measure, the
  //            solutions in a two-up grid beneath. No stats card, and no blue
  //            swoosh either — it is anchored to the card's top edge, so with no
  //            card there is nothing for it to meet.
  //
  // `boolean` values arrive as the strings "true"/"false".
  const stats =
    fieldValue(section, 'use_stats') === 'true'
      ? referencesFrom(section, 'stats')
      : [];
  const hasStats = stats.length > 0;

  if (!solutions.length) return null;

  return (
    <section
      className={`solutions ${
        hasStats ? 'solutions--with-stats' : 'solutions--no-stats'
      }`}
    >
      {/* CLIPPING BOX. It exists because the section itself must NOT clip: the
          green curve below hangs past the section's bottom edge on purpose. Every
          other piece of artwork here still has to be trimmed at that box — the
          swoosh overhangs the top, the blue dot bleeds off the side on a phone,
          the green glow off the left — so the clip moved down one level onto a
          wrapper that has the same geometry as the section.

          `clip` rather than `hidden`: hidden would make this a scroll container.
          `position: relative` is load-bearing — .solutions__green-glow is
          absolute, and if its containing block were the section (outside this
          box) it would escape the clip entirely rather than being trimmed by
          it. */}
      <div className="solutions__clip">
        {/* Stacked layout only. The split layout has the swoosh and the stats card
            carrying the colour, and the split reference shows neither of these. */}
        {!hasStats && <GreenGlow className="solutions__green-glow" />}

        <div className="solutions__inner">
          {!hasStats && <BlueDot className="solutions__blue-dot" />}
          <div className="solutions__intro">
            {title && (
              <h2 className="solutions__title">
                {accentedTitle(title, {
                  accent: 'solutions__accent',
                  blue: 'solutions__accent--blue',
                  green: 'solutions__accent--green',
                })}
              </h2>
            )}
            {description && <p className="solutions__description">{description}</p>}

            {/* The swoosh is anchored to the top of this block rather than to the
                section, so it meets the stats card at any width — see the CSS.
                Both live or neither: with no card the arc has nothing to meet, and
                the stacked reference shows no arc. */}
            {hasStats && (
              <div className="solutions__stats-block">
                <div className="solutions__backdrop">
                  <SwooshBackdrop className="solutions__swoosh" />
                </div>

                <ul className="solutions__stats">
                  {stats.map((stat) => {
                    const value = fieldValue(stat, 'value', 'title');
                    const label = fieldValue(stat, 'description', 'label');

                    return (
                      <li key={stat.id} className="solutions__stat">
                        {value && (
                          <span className="solutions__stat-value">{value}</span>
                        )}
                        {label && <p className="solutions__stat-label">{label}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <ul className="solutions__list">
            {solutions.map((item) => {
              const itemTitle = fieldValue(item, 'title', 'name');
              const itemDescription = fieldValue(item, 'description');
              const icon = imageFrom(item, 'image', 'icon');
              const button = linkFrom(item, 'button', 'link');

              return (
                <li key={item.id} className="solutions__item">
                  {icon && (
                    <Image
                      src={icon.url}
                      alt={icon.altText ?? ''}
                      width={icon.width ?? 106}
                      height={icon.height ?? 106}
                      className="solutions__icon"
                      unoptimized={/\.svg(\?|$)/i.test(icon.url)}
                    />
                  )}

                  <div className="solutions__body">
                    {itemTitle && (
                      <h3 className="solutions__item-title">{itemTitle}</h3>
                    )}
                    {itemDescription && (
                      <p className="solutions__item-description">{itemDescription}</p>
                    )}
                    {button && (
                      <Button
                        href={button.url}
                        variant="secondary"
                        size="sm"
                        arrow="rise"
                        className="solutions__item-button"
                      >
                        {button.text}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Split layout only, and deliberately OUTSIDE .solutions__clip so it can
          carry on into the section below — see the .solutions__green-curve block
          in the CSS. Paired with the blue swoosh at the top of this same layout:
          both live or neither. */}
      {hasStats && <GreenCurveBackdrop className="solutions__green-curve" />}
    </section>
  );
}
