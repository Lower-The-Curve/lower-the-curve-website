import Image from 'next/image';
import styles from './HeroSection.module.css';
import ChevronsDownIcon from './ChevronsDownIcon';

// The metaobject type this component renders. Used to dispatch sections to the
// right component at render time.
export const HERO_SECTION_TYPE = 'hero_section';

// Colocated GraphQL fragment: this component declares exactly what it needs
// from a `hero_section` metaobject. The page queries spread this fragment in, so
// adding/removing fields here is all that's required — the query stays generic.
//
// Metaobjects share the generic `Metaobject` type in the Storefront API, so the
// fragment selects the `fields` list and the component reads fields by key.
//
// Every field on the definition comes through this one selection:
//   title                -> single_line_text_field, the headline
//   description          -> multi_line_text_field, optional lede under it
//   image                -> file_reference, the full-bleed background artwork
//   image_mobile         -> file_reference, an optional phone-shaped counterpart
//                           to `image`; see mobileImage below for what happens
//                           when it is absent
//   content_align        -> single_line_text_field, "Left" | "Center" | "Right"
//   scroll_botttom_text  -> single_line_text_field, the scroll cue's label
//   margin_top           -> number_integer, extra space above the section (px)
//   margin_bottom        -> number_integer, extra space below the section (px)
export const heroSectionFragment = /* GraphQL */ `
  fragment HeroSectionFields on Metaobject {
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
`;

// Read a single field by key from a metaobject node.
function field(section, key) {
  return section?.fields?.find((f) => f.key === key) ?? null;
}

// First non-empty value across the given keys. Several keys are accepted so a
// rename in the Shopify admin doesn't blank the section out — note the live
// definition spells the scroll cue `scroll_botttom_text` (three t's).
function fieldValue(section, ...keys) {
  for (const key of keys) {
    const value = field(section, key)?.value;
    if (value) return value;
  }
  return null;
}

// First resolved image across the given keys. Multi-key for the same reason
// fieldValue is: a rename in the admin shouldn't blank the artwork out.
function imageFrom(section, ...keys) {
  for (const key of keys) {
    const image = field(section, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

// `number_integer` values arrive as strings. Anything unparseable (or absent)
// means "no extra margin" rather than breaking the layout with a NaN.
function pixels(section, key) {
  const parsed = Number.parseInt(fieldValue(section, key) ?? '', 10);
  return `${Number.isFinite(parsed) ? parsed : 0}px`;
}

// `content_align` is free text in the admin ("Center " arrives with a trailing
// space), so it's normalized before lookup. Center is the section's designed
// default when the field is empty.
const ALIGN_CLASSES = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

function alignClass(section) {
  const authored = fieldValue(section, 'content_align')?.trim().toLowerCase();
  return ALIGN_CLASSES[authored] ?? ALIGN_CLASSES.center;
}

// The design accents part of the headline — a green run and a blue one — and
// those runs are also the only bold text in it, against a regular-weight
// heading. Which words they are is editorial, so it's authored in the metafield
// as HTML spans rather than matched by word in here:
//
//   Let’s Launch a <span class="green-gradient">Shopify Store</span> with
//   <span class="blue-gradient">us</span>
//
// The value is parsed, never injected — there is no dangerouslySetInnerHTML.
// Only <span> carrying a class in the map below produces an element, so a stray
// tag or a pasted <script> can't turn into markup. A title with no spans renders
// as plain text, and an unrecognised class keeps its words but drops the accent.
const ACCENT_CLASSES = {
  'green-gradient': styles.green,
  'blue-gradient': styles.blue,
};

const ACCENT_SPAN =
  /<span\b[^>]*\bclass=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>/gi;

function accentedTitle(title) {
  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(ACCENT_SPAN)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));

    // Tolerates extra classes on the span (`class="green-gradient wide"`).
    const accent = match[1]
      .split(/\s+/)
      .map((name) => ACCENT_CLASSES[name])
      .find(Boolean);

    parts.push(
      accent ? (
        <span key={match.index} className={`${styles.accent} ${accent}`}>
          {match[2]}
        </span>
      ) : (
        match[2]
      )
    );

    cursor = match.index + match[0].length;
  }

  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}

export default function HeroSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description');
  const image = imageFrom(section, 'image');
  // The phone-shaped artwork. The live `hero_section` entry has no value for this
  // today, so it resolves to null and `image` covers every width — the hero is
  // never left with no artwork. Set `image_mobile` on the metaobject and it takes
  // over below the mobile breakpoint with no code change; `mobile_image` is
  // accepted too, so whichever spelling the field ends up with wins.
  //
  // NOTE: the Storefront API omits fields that have no value, so a field existing
  // on the definition but left empty looks identical to no field at all from here.
  // If setting it has no effect, check the field is published to the Storefront
  // API rather than assuming the key is wrong.
  const mobileImage = imageFrom(section, 'image_mobile', 'mobile_image');
  const scrollText = fieldValue(
    section,
    'scroll_botttom_text',
    'scroll_bottom_text'
  );

  return (
    <section
      className={`${styles.hero} ${alignClass(section)}`}
      style={{
        '--hero-margin-top': pixels(section, 'margin_top'),
        '--hero-margin-bottom': pixels(section, 'margin_bottom'),
      }}
    >
      {/* Sits behind the content and reaches above the section's own top edge,
          so the artwork starts at the very top of the page and the transparent
          header renders over it — see HeroSection.module.css. */}
      {image && (
        <div className={styles.backdrop}>
          {/* Two elements rather than one with a swapped src: this is a Server
              Component, so there is no viewport to branch on at render time and
              the choice has to be made in CSS. When no mobile artwork is authored
              the desktop one carries every width and neither class is applied. */}
          <Image
            src={image.url}
            alt={image.altText ?? ''}
            fill
            sizes="100vw"
            priority
            className={`${styles.backdropImage} ${
              mobileImage ? styles.wide : ''
            }`}
            unoptimized={/\.svg(\?|$)/i.test(image.url)}
          />

          {mobileImage && (
            <Image
              src={mobileImage.url}
              alt={mobileImage.altText ?? ''}
              fill
              sizes="100vw"
              priority
              className={`${styles.backdropImage} ${styles.narrow}`}
              unoptimized={/\.svg(\?|$)/i.test(mobileImage.url)}
            />
          )}
        </div>
      )}

      <div className={styles.content}>
        {title && <h1 className={styles.title}>{accentedTitle(title)}</h1>}
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {scrollText && (
        <div className={styles.scroll}>
          <span className={styles.scrollText}>{scrollText}</span>
          <ChevronsDownIcon className={styles.scrollIcon} />
        </div>
      )}
    </section>
  );
}
