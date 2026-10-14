import Image from 'next/image';
import './HeroSection.css';
import ChevronsDownIcon from './ChevronsDownIcon';

// The metaobject type this component renders. Used to dispatch sections to the
// right component at render time.
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/hero.js. Every
// field on the definition comes through that one selection:
//   title                -> single_line_text_field, the headline
//   description          -> multi_line_text_field, optional lede under it
//   image                -> file_reference, the full-bleed background artwork
//   image_mobile         -> file_reference, an optional phone-shaped counterpart
//                           to `image`; see mobileImage below for what happens
//                           when it is absent
//   content_align        -> single_line_text_field, "Left" | "Center" | "Right"
//   scroll_botttom_text  -> single_line_text_field, the scroll cue's label
//   scroll_align         -> optional "Left" | "Center" | "Right"; empty follows content_align
//   scroll_color         -> optional "Blue" | "White"; empty is Blue
//   content_position_mobile -> optional choice list, phones only (≤575px):
//                           "Top Left" | "Top Center" | "Center Left" |
//                           "Center Center". Empty keeps the desktop placement
//   margin_top           -> number_integer, extra space above the section (px)
//   margin_bottom        -> number_integer, extra space below the section (px)
export const HERO_SECTION_TYPE = 'hero_section';

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
  left: 'hero--align-left',
  center: 'hero--align-center',
  right: 'hero--align-right',
};

function alignClass(section) {
  const authored = fieldValue(section, 'content_align')?.trim().toLowerCase();
  return ALIGN_CLASSES[authored] ?? ALIGN_CLASSES.center;
}

// Scroll cue overrides: alignment and colour, independent of the headline.
function scrollClasses(section) {
  const align = fieldValue(section, 'scroll_align')?.trim().toLowerCase();
  const color = fieldValue(section, 'scroll_color')?.trim().toLowerCase();
  return [
    ALIGN_CLASSES[align] && `hero--scroll-${align}`,
    color === 'white' && 'hero--scroll-white',
  ]
    .filter(Boolean)
    .join(' ');
}

// Phone-only placement of the headline block, from `content_position_mobile`:
// "Top Left" | "Top Center" | "Center Left" | "Center Center" (any casing).
// The first word is the vertical position, the second the text alignment.
// Only the headline moves — the scroll cue keeps its own alignment. Empty or
// unrecognised values leave the desktop behaviour.
const MOBILE_VERTICAL = {
  top: 'hero--mobile-top',
  center: 'hero--mobile-center',
};
const MOBILE_ALIGN = {
  left: 'hero--mobile-align-left',
  center: 'hero--mobile-align-center',
};

function mobilePositionClasses(section) {
  const [vertical, horizontal] = (
    fieldValue(section, 'content_position_mobile') ?? ''
  )
    .trim()
    .toLowerCase()
    .split(/\s+/);
  return [MOBILE_VERTICAL[vertical], MOBILE_ALIGN[horizontal]]
    .filter(Boolean)
    .join(' ');
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
  'green-gradient': 'hero__accent--green',
  'blue-gradient': 'hero__accent--blue',
};

const ACCENT_SPAN =
  /<span\b[^>]*\bclass=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>|<br\s*\/?>/gi;

function accentedTitle(title) {
  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(ACCENT_SPAN)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));

    // <br>: an authored line break.
    if (match[1] === undefined) {
      parts.push(<br key={match.index} />);
      cursor = match.index + match[0].length;
      continue;
    }

    // Tolerates extra classes on the span (`class="green-gradient wide"`).
    const accent = match[1]
      .split(/\s+/)
      .map((name) => ACCENT_CLASSES[name])
      .find(Boolean);

    parts.push(
      accent ? (
        <span key={match.index} className={`hero__accent ${accent}`}>
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

// The scroll label may bold part of itself, as in the design:
//   Scroll down to <strong>Explore more</strong>
// Only <strong>/<b> are understood; the rest renders as text.
const SCROLL_STRONG = /<(strong|b)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;

function scrollLabel(text) {
  const parts = [];
  let cursor = 0;
  for (const match of text.matchAll(SCROLL_STRONG)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <strong key={match.index} className="hero__scroll-strong">
        {match[2]}
      </strong>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export default function HeroSection({
  section,
  appIcons = false,
  fadeBottom = false,
  fadeTop = false,
}) {
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
      className={[
        'hero',
        alignClass(section),
        scrollClasses(section),
        mobilePositionClasses(section),
        fadeBottom && 'hero--fade-bottom',
        fadeTop && 'hero--fade-top',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--hero-margin-top': pixels(section, 'margin_top'),
        '--hero-margin-bottom': pixels(section, 'margin_bottom'),
      }}
    >
      {/* Sits behind the content and reaches above the section's own top edge,
          so the artwork starts at the very top of the page and the transparent
          header renders over it — see HeroSection.css. */}
      {image && (
        <div className="hero__backdrop">
          {/* Two elements rather than one with a swapped src: this is a Server
              Component, so there is no viewport to branch on at render time and
              the choice has to be made in CSS. When no mobile artwork is
              authored the desktop one carries every width, so it gets no
              --wide modifier and neither art-direction rule matches. */}
          <Image
            src={image.url}
            alt={image.altText ?? ''}
            fill
            sizes="100vw"
            priority
            className={`hero__image ${mobileImage ? 'hero__image--wide' : ''}`}
            unoptimized={/\.svg(\?|$)/i.test(image.url)}
          />

          {mobileImage && (
            <Image
              src={mobileImage.url}
              alt={mobileImage.altText ?? ''}
              fill
              sizes="100vw"
              priority
              className="hero__image hero__image--narrow"
              unoptimized={/\.svg(\?|$)/i.test(mobileImage.url)}
            />
          )}
        </div>
      )}

      <div className="hero__content">
        <div className="hero__heading">
          {appIcons && (
            <div className="hero__icons-row" aria-hidden="true">
              <Image
                src="/assets/Shopify apps logos frame.svg"
                alt=""
                width={329}
                height={54}
                unoptimized
              />
            </div>
          )}

          {appIcons && (
            <div className="hero__icons hero__icons--left" aria-hidden="true">
              <Image
                src="/assets/Group 1597880416.svg"
                alt=""
                width={213}
                height={434}
                unoptimized
              />
            </div>
          )}

          {title && (
            <h1
              className={
                /<br\s*\/?>/i.test(title)
                  ? 'hero__title hero__title--manual'
                  : 'hero__title'
              }
            >
              {accentedTitle(title)}
            </h1>
          )}

          {appIcons && (
            <div className="hero__icons hero__icons--right" aria-hidden="true">
              <Image
                src="/assets/Group 1597880416 (1).svg"
                alt=""
                width={213}
                height={428}
                unoptimized
              />
            </div>
          )}
        </div>

        {description && <p className="hero__description">{description}</p>}
      </div>

      {scrollText && (
        <div className="hero__scroll">
          <span
            className={
              /<(strong|b)\b/i.test(scrollText)
                ? 'hero__scroll-text hero__scroll-text--mixed'
                : 'hero__scroll-text'
            }
          >
            {scrollLabel(scrollText)}
          </span>
          <ChevronsDownIcon className="hero__scroll-icon" />
        </div>
      )}
    </section>
  );
}