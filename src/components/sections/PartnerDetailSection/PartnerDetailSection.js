import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import ChevronsDownIcon from '@/components/sections/HeroSection/ChevronsDownIcon';
import './PartnerDetailSection.css';

// The partner hero — a whole page's content, not a slot in a `content` entry.
// It reads a single `partner_detail` metaobject:
//   - `name`         : metaobject_reference -> the `partner` entry. Its handle
//                      is the URL key (`/partners/blackroll`) and its `name`
//                      field is the heading. Never route on this entry's own
//                      auto-generated handle.
//   - `subheading`   : single_line_text_field, the line under the name. Carries
//                      `<strong>` markup — parsed by accentedTitle, never
//                      injected.
//   - `body`         : multi_line_text_field; blank lines split it into
//                      paragraphs (see paragraphs below).
//   - `mockup`       : file_reference -> MediaImage, the device mockup.
//   - `service_tags` : list.metaobject_reference -> `service_tag` entries, each
//                      carrying `label`, `color`, `color_end` and an optional
//                      middle stop `color_3`. The list's order is the render
//                      order.
//   - `scroll_text`  : single_line_text_field for the scroll cue. The cue is
//                      visual only — see the component below.
//   - `back_label` + `back_link` : the back link. `back_label` is live
//                      ("All Partners"); the destination may be a `url` (bare
//                      string) or a `link` (JSON) field. The Storefront API
//                      omits a field with no value, so an entry can have the
//                      label but no readable destination — the label then
//                      renders as text rather than disappearing, and becomes a
//                      link the moment `back_link` has a value. Neither label
//                      nor destination is ever hardcoded.
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/partnerDetail.js.
export const PARTNER_DETAIL_TYPE = 'partner_detail';

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

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;

    if (image) return image;
  }

  return null;
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

function tagBackground(tag) {
  const stops = ['color', 'color_3', 'color_end']
    .map((key) => fieldValue(tag, key))
    .filter(Boolean);

  if (!stops.length) return null;

  if (stops.length === 1) {
    return `linear-gradient(135deg, ${stops[0]}, ${stops[0]})`;
  }

  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

function tagItems(section) {
  const tags = field(section, 'service_tags') ?? field(section, 'tags');

  return (tags?.references?.nodes ?? [])
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      label: fieldValue(node, 'label', 'name', 'title'),
      background: tagBackground(node),
    }))
    .filter((tag) => tag.label);
}

export default function PartnerDetailSection({ section }) {
  if (!section) return null;

  const partner = field(section, 'name')?.reference;

  const heading = fieldValue(partner, 'name', 'title') ?? partner?.handle;

  const subheading = fieldValue(section, 'subheading', 'subtitle');

  const body = paragraphs(fieldValue(section, 'body', 'description') ?? '');

  const mockup = imageFrom(section, 'mockup', 'image');

  const tags = tagItems(section);

  const scrollText = fieldValue(section, 'scroll_text');

  const backLabel = fieldValue(section, 'back_label', 'back_text');

  const backUrl = linkFrom(section, 'back_link', 'back_url', 'back')?.url ?? null;

  const BackTag = backUrl ? 'a' : 'span';

  return (
    <section
      className={`partner-detail${
        mockup ? '' : ' partner-detail--no-media'
      }`}
    >
      <div className="partner-detail__inner">
        {backLabel && (
          <BackTag className="partner-detail__back" href={backUrl}>
            <svg
              className="partner-detail__back-icon"
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 1L1 7L7 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </BackTag>
        )}

        {mockup && (
          <div className="partner-detail__media">
            {/* Decorative eclipses behind the mockup, sized and placed as
                fractions of the media box so they travel with it at every
                breakpoint. The blue circle sits over the green glow, matching
                the design; both sit below the mockup because the media is a
                stacking context and these carry negative z-index.
                Pure decoration — hidden from assistive tech. */}
            <img
              src="/assets/partner-detail-eclipse-blue.svg"
              alt=""
              aria-hidden="true"
              className="partner-detail__eclipse partner-detail__eclipse--blue"
              width={744}
              height={690}
              decoding="async"
            />
            <img
              src="/assets/partner-detail-eclipse-green.svg"
              alt=""
              aria-hidden="true"
              className="partner-detail__eclipse partner-detail__eclipse--green"
              width={426}
              height={187}
              decoding="async"
            />
            <div className="partner-detail__blur" aria-hidden="true" />
            <Image
              src={mockup.url}
              alt={mockup.altText ?? ''}
              width={mockup.width ?? 2196}
              height={mockup.height ?? 1556}
              className="partner-detail__mockup"
              sizes="(max-width: 575px) 140vw, (max-width: 1024px) 500px, 78vw"
              unoptimized={/\.svg(\?|$)/i.test(mockup.url)}
            />
          </div>
        )}

        <div className="partner-detail__content">
          {tags.length > 0 && (
            <ul className="partner-detail__tags">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="partner-detail__tag"
                  style={
                    tag.background
                      ? { '--partner-detail-tag-bg': tag.background }
                      : undefined
                  }
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          )}

          {heading && <h1 className="partner-detail__title">{heading}</h1>}

          {subheading && (
            <p className="partner-detail__subheading">
              {accentedTitle(subheading, { accent: 'partner-detail__accent' })}
            </p>
          )}

          {body.length > 0 && (
            <div className="partner-detail__copy">
              {body.map((text, i) => (
                <p key={i} className="partner-detail__paragraph">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {scrollText && (
        <div className="partner-detail__scroll">
          <span className="partner-detail__scroll-text">{scrollText}</span>
          <ChevronsDownIcon className="partner-detail__scroll-icon" />
        </div>
      )}
    </section>
  );
}
