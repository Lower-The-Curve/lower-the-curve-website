import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import './BannerSection.css';

// The banner section is a single `banner` metaobject with:
//   - `heading`          : single_line_text_field, the display heading. Carries
//                          the accent markup — see accentedTitle.
//   - `description`      : multi_line_text_field, the body paragraph.
//   - `background_image` : file_reference -> the full-bleed background artwork.
//   - `collage`          : file_reference -> the client collage. The reader
//                          accepts the list shape too, so retyping the field to
//                          a list needs no code change.
//   - `highlights`       : list.metaobject_reference -> the icon+label items,
//                          each a `banner_highlight` entry carrying `label` and
//                          `icon`.
//   - `button`           : link -> { text, url } for the CTA.
//
// Nothing here is tied to one client: the background, collage, copy, highlight
// items and CTA all come from the entry, and the highlight list's LENGTH is the
// number of items rendered while its ORDER is the render order.
export const BANNER_TYPE = 'banner';

// Colocated GraphQL fragment. Same shape as the other sections': the page query
// spreads it and hardcodes no field selections of its own.
export const bannerSectionFragment = /* GraphQL */ `
  fragment BannerSectionFields on Metaobject {
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
      # first: 50 must match the other section fragments that select the
      # references field on a MetaobjectField (Solutions uses 50). GraphQL
      # merges same-typed selections and rejects differing arguments — 20 here
      # would conflict with Solutions in the home page query.
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

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

// The collage field is a single `file_reference` today, but the live shape may
// become a list — both are read so the admin can be retyped without touching
// this component.
function collageImages(section) {
  const collage = field(section, 'collage') ?? field(section, 'images');
  if (!collage) return [];

  const single = collage.reference?.image;
  const list = (collage.references?.nodes ?? [])
    .map((node) => node?.reference?.image)
    .filter(Boolean);

  return [single, ...list].filter(Boolean);
}

// The button field comes in two shapes and BOTH are handled: a `link` field
// carries { text, url }, while a `url` field is a bare URL with no label. The
// CTA label is editorial, so a link with no text renders no button rather than
// a captionless one.
function linkFrom(node, ...keys) {
  const raw = fieldValue(node, ...keys);
  if (!raw) return null;

  try {
    const { text, url } = JSON.parse(raw);
    return url ? { text: text || null, url } : null;
  } catch {
    return { text: null, url: raw };
  }
}

// The icon+label items, in authored order. Each is its own `banner_highlight`
// entry — the list is what makes the count data-driven.
function highlightItems(section) {
  const highlights = field(section, 'highlights') ?? field(section, 'highlight');

  return (highlights?.references?.nodes ?? [])
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      label: fieldValue(node, 'label', 'title', 'name'),
      icon: imageFrom(node, 'icon', 'image'),
    }))
    .filter((item) => item.label);
}

// The background artwork is full-bleed, so it is set through a custom property
// and painted by the stylesheet rather than rendered as an <img>. The flat brand
// colour underneath is the fallback for an entry with no image.
function backgroundStyle(image) {
  return image ? { '--banner-bg-image': `url(${image.url})` } : undefined;
}

export default function BannerSection({ section }) {
  if (!section) return null;

  const heading = fieldValue(section, 'heading', 'title');
  const description = fieldValue(section, 'description', 'text');
  const background = imageFrom(section, 'background_image', 'background');
  const collage = collageImages(section);
  const items = highlightItems(section);
  const button = linkFrom(section, 'button', 'link');

  return (
    <section className="banner" style={backgroundStyle(background)}>
      <div className="banner__inner">
        {/* First in the DOM, so it stacks ABOVE the copy when the grid collapses
            at the narrow breakpoints — no `order` needed. */}
        {collage.length > 0 && (
          <div className="banner__media">
            {collage.map((image, i) => (
              <Image
                key={i}
                src={image.url}
                alt={image.altText ?? ''}
                width={image.width ?? 1000}
                height={image.height ?? 1000}
                className="banner__image"
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized={/\.svg(\?|$)/i.test(image.url)}
              />
            ))}
          </div>
        )}

        <div className="banner__content">
          {heading && (
            <h2 className="banner__title">
              {accentedTitle(heading, { accent: 'banner__accent' })}
            </h2>
          )}

          {description && <p className="banner__description">{description}</p>}

          {items.length > 0 && (
            <ul className="banner__highlights">
              {items.map((item) => (
                <li key={item.id} className="banner__highlight">
                  {item.icon && (
                    <Image
                      src={item.icon.url}
                      alt=""
                      width={item.icon.width ?? 32}
                      height={item.icon.height ?? 32}
                      className="banner__highlight-icon"
                      unoptimized={/\.svg(\?|$)/i.test(item.icon.url)}
                    />
                  )}
                  <span className="banner__highlight-label">{item.label}</span>
                </li>
              ))}
            </ul>
          )}

          {/* `inverse` — the white pill for a brand-coloured surface (see
              Button.css): the reference's CTA has no border and must not flip
              to a blue fill on hover, which `secondary` would do on this
              background. */}
          {button?.text && button?.url && (
            <Button
              href={button.url}
              variant="inverse"
              arrow="rise"
              className="banner__button"
            >
              {button.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
