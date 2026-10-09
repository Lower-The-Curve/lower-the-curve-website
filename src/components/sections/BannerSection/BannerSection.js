import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import BannerHighlights from './BannerHighlights';
import './BannerSection.css';

// The banner section is a single `banner` metaobject with:
//   - `heading`          : single_line_text_field, the display heading. Carries
//                          the accent markup — see accentedTitle.
//   - `description`      : multi_line_text_field, the body paragraph.
//   - `background_image` : file_reference -> the full-bleed background artwork.
//   - `collage`          : file_reference -> the client collage. The reader
//                          accepts the list shape too, so retyping the field to
//                          a list needs no code change.
//   - `collage_mobile`   : file_reference -> an optional phone-shaped counterpart
//                          to `collage`. When set it takes over on <= 1024px;
//                          when absent the collage covers every width (see the
//                          ART DIRECTION block in BannerSection.css).
//   - `highlights`       : list.metaobject_reference -> the icon+label items,
//                          each a `banner_highlight` entry carrying `label` and
//                          `icon`.
//   - `button`           : link -> { text, url } for the CTA.
//   - `show_highlights`  : boolean, hides the highlight list without deleting
//                          it. ABSENT means shown — see toggledOn.
//   - `show_button`      : boolean, hides the CTA without deleting it. Same
//                          absent-means-shown rule.
//   - `story_layout`     : boolean, picks the STORY layout — the heading takes
//                          the collage column and the copy the text column, over
//                          the same artwork (a collage is ignored). ABSENT/false
//                          is the spotlight layout. See isStory below.
//
// Nothing here is tied to one client: the background, collage, copy, highlight
// items and CTA all come from the entry, and the highlight list's LENGTH is the
// number of items rendered while its ORDER is the render order. Every block is
// independently optional, so an entry with only `heading` + `description` is a
// complete banner — the `banner--no-media` modifier collapses the collage
// column for it.
//
// The `description` is not necessarily one block: blank lines split it into
// paragraphs (see paragraphs below), as in the case-studies section.
export const BANNER_TYPE = 'banner';

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

function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toggledOn(node, ...keys) {
  return fieldValue(node, ...keys) !== 'false';
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;

    if (image) return image;
  }

  return null;
}

function collageImages(section, ...keys) {
  let collage = null;

  for (const key of keys) {
    collage = field(section, key);

    if (collage) break;
  }

  if (!collage) return [];

  const single = collage.reference?.image;

  const list = (collage.references?.nodes ?? [])
    .map((node) => node?.reference?.image)
    .filter(Boolean);

  return [single, ...list].filter(Boolean);
}

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

function backgroundStyle(image) {
  return image ? { '--banner-bg-image': `url(${image.url})` } : undefined;
}

export default function BannerSection({ section }) {
  if (!section) return null;

  const heading = fieldValue(section, 'heading', 'title');

  const description = fieldValue(section, 'description', 'text');

  const background = imageFrom(section, 'background_image', 'background');

  const collage = collageImages(section, 'collage', 'images');

  const collageMobile = collageImages(section, 'collage_mobile', 'mobile_collage');

  const items = toggledOn(section, 'show_highlights')
    ? highlightItems(section)
    : [];

  const button = toggledOn(section, 'show_button')
    ? linkFrom(section, 'button', 'link')
    : null;

  const isStory = fieldValue(section, 'story_layout') === 'true';

  const hasMedia = !isStory && collage.length > 0;

  const body = paragraphs(description ?? '');

  return (
    <section
      className={`banner${hasMedia ? '' : ' banner--no-media'}${
        isStory ? ' banner--story' : ''
      }`}
      style={backgroundStyle(background)}
    >
      <div className="banner__inner">
        {hasMedia && (
          <div className="banner__media">
            {collage.map((image, i) => (
              <Image
                key={i}
                src={image.url}
                alt={image.altText ?? ''}
                width={image.width ?? 1000}
                height={image.height ?? 1000}
                className={`banner__image${
                  collageMobile.length > 0 ? ' banner__image--wide' : ''
                }`}
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized={/\.svg(\?|$)/i.test(image.url)}
              />
            ))}

            {collageMobile.map((image, i) => (
              <Image
                key={i}
                src={image.url}
                alt={image.altText ?? ''}
                width={image.width ?? 1000}
                height={image.height ?? 1000}
                className="banner__image banner__image--narrow"
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

          {body.length > 0 && (
            <div className="banner__copy">
              {body.map((text, i) => (
                <p key={i} className="banner__description">
                  {text}
                </p>
              ))}
            </div>
          )}

          {items.length > 0 && <BannerHighlights items={items} />}

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
