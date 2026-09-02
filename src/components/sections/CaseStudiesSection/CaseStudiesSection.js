import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import './CaseStudiesSection.css';

// The case studies section is a single `case_studies` metaobject with:
//   - `title`       : single_line_text_field, the heading. Carries the accent
//                     markup (<span class="blue-gradient">, <strong>, <br>) —
//                     see accentedTitle.
//   - `description` : multi_line_text_field. BLANK LINES SPLIT IT INTO
//                     PARAGRAPHS, so the design's three blocks are one field.
//   - `image`       : file_reference -> the device mockups.
//   - `button`      : link -> { text, url } for the "Explore More" pill.
//
// NOTE: this definition does not exist in the store yet — every plausible type
// name was probed and none returned an entry. The section renders nothing until
// it is created, which is why `if (!section) return null` is not a bug you are
// seeing. See DESIGN-SYSTEM.md for the exact definition to add.
export const CASE_STUDIES_TYPE = 'case_studies';

// Colocated GraphQL fragment. Same shape as the other sections': the page query
// spreads this and hardcodes no field selections of its own.
export const caseStudiesSectionFragment = /* GraphQL */ `
  fragment CaseStudiesSectionFields on Metaobject {
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

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

// The button field comes in two shapes and BOTH are handled, because the live
// entry uses the second one:
//
//   `link` type -> JSON: { "text": "Explore More", "url": "..." }  (label included)
//   `url`  type -> a bare URL string                               (NO label)
//
// The live `case_studies` entry types this as `url`, so there is no label in the
// CMS at all — hence BUTTON_TEXT below. Parsing this with JSON.parse alone throws
// on a bare URL and silently drops the button, which is exactly what happened.
function linkFrom(node, ...keys) {
  const raw = fieldValue(node, ...keys);
  if (!raw) return null;

  try {
    const { text, url } = JSON.parse(raw);
    return url ? { text: text || null, url } : null;
  } catch {
    // Not JSON: a `url` field, or the field retyped to plain text.
    return { text: null, url: raw };
  }
}

// The design sets the body copy as three separate paragraphs. Rather than three
// fields, one multi_line_text_field is split on BLANK LINES — so an editor adds
// or removes a paragraph by pressing return twice, and single line breaks inside
// a paragraph are still honoured (see .paragraph's white-space: pre-line).
function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// FALLBACK LABEL. The live `button` field is a `url`, which carries no text, so
// the design's label lives here. It is a fallback, not a default — authoring
// either a `button_text` field or retyping `button` to `link` takes over with no
// code change, and this constant can then be deleted. Copy belongs in the CMS.
const BUTTON_TEXT = 'Explore More';

export default function CaseStudiesSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description', 'paragraph', 'text');
  const image = imageFrom(section, 'image', 'media');
  const button = linkFrom(section, 'button', 'link');
  // An explicit label field wins, then the one a `link` field carries, then the
  // design's copy — so the button is never rendered captionless.
  const buttonText =
    fieldValue(section, 'button_text', 'button_label') ??
    button?.text ??
    BUTTON_TEXT;

  return (
    <section
      className={`case-studies ${
        image ? 'case-studies--has-media' : ''
      }`}
    >
      <div className="case-studies__inner">
        {/* First in the DOM so it stacks ABOVE the copy when the grid collapses,
            which is what the narrow reference shows — no `order` needed. */}
        {image && (
          <div className="case-studies__media">
            <Image
              src={image.url}
              alt={image.altText ?? ''}
              width={image.width ?? 1000}
              height={image.height ?? 800}
              className="case-studies__image"
              sizes="(max-width: 1024px) 100vw, 42vw"
              unoptimized={/\.svg(\?|$)/i.test(image.url)}
            />
          </div>
        )}

        <div className="case-studies__content">
          {title && (
            <h2 className="case-studies__title">
              {accentedTitle(title, {
                accent: 'case-studies__accent',
                blue: 'case-studies__accent--blue',
                green: 'case-studies__accent--green',
              })}
            </h2>
          )}

          {description && (
            <div className="case-studies__copy">
              {paragraphs(description).map((text, i) => (
                <p key={i} className="case-studies__paragraph">
                  {text}
                </p>
              ))}
            </div>
          )}

          {button && (
            <Button
              href={button.url}
              variant="secondary"
              arrow="rise"
              className="case-studies__button"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
