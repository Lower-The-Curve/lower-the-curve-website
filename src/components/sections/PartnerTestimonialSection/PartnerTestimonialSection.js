import Image from 'next/image';
import PartnerTestimonialShape from './PartnerTestimonialShape';
import { QuoteCloseIcon, QuoteOpenIcon } from './PartnerTestimonialQuotes';
import './PartnerTestimonialSection.css';

// The partner page's testimonial — a single notched card, centred, with no
// heading. It reads one `teestimonial` metaobject:
//   - `description`   : multi_line_text_field, the quotation. The live value
//                       carries a paragraph break authored as U+2028 followed by
//                       a newline; quoteParagraphs() splits on both and never
//                       renders the separator glyph.
//   - `name`          : single_line_text_field, the person ("Hans Muller").
//   - `company`       : single_line_text_field, THE ROLE despite the key name.
//                       The live value is "COO"; it renders as the second line
//                       under the name, not "corrected" to a company.
//   - `company_logo`  : file_reference -> MediaImage, seated in the bottom-left
//                       notch of the card.
//
// There is no reference field on `teestimonial`: the parent links to it by
// handle prefix (`blackroll` -> `blackroll-hans-muller`) in
// getPartnerTestimonial() in lib/shopify/index.js. The type's live API
// identifier is `teestimonial` (doubled "e") — Shopify fixes identifiers at
// creation, so the typo is the real key.
//
// THE CARD OUTLINE AND THE QUOTE MARKS ARE THE DESIGNER'S EXPORTS, inlined:
// PartnerTestimonialShape.js is public/assets/background rectangle.svg, and
// PartnerTestimonialQuotes.js is the down-“ / up-“ pair. The card is no longer
// clipped — the shape SVG carries the fill, the edge and the notch, stretched
// to the card's box.
//
// THE AUTHOR ROW IS A SIBLING OF THE SHAPE LAYER: the reference seats the name
// box immediately right of the logo, which puts it inside the notch's x-range,
// and the logo and box have to sit in the cutout rather than behind it. It
// overlays the notch's bottom band (22.78% of the card — the export's own
// 41/180), and the card reserves enough bottom padding that the quote ends
// above the bite.
//
// Its GraphQL fragment lives in
// lib/shopify/queries/sections/partnerTestimonial.js.
export const PARTNER_TESTIMONIAL_TYPE = 'teestimonial';

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

// U+2028 (line separator) followed by a newline is one authored paragraph
// break; a bare newline counts too. Splitting on either and trimming drops the
// separator glyph rather than rendering it.
function quoteParagraphs(text) {
  return text
    .split(/[\u2028\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function PartnerTestimonialSection({ section }) {
  if (!section) return null;

  const quote = field(section, 'description')?.value;
  const name = field(section, 'name')?.value;
  const role = field(section, 'company')?.value;
  const logo = field(section, 'company_logo')?.reference?.image ?? null;

  if (!quote && !name && !role && !logo) return null;

  const paragraphs = quote ? quoteParagraphs(quote) : [];

  return (
    <section className="partner-testimonial">
      <div className="partner-testimonial__inner">
        <div className="partner-testimonial__card-wrap">
          <div className="partner-testimonial__card">
            <PartnerTestimonialShape className="partner-testimonial__shape" />

            <QuoteOpenIcon className="partner-testimonial__quote-mark partner-testimonial__quote-mark--open" />

            {paragraphs.length > 0 && (
              <blockquote className="partner-testimonial__quote">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="partner-testimonial__quote-paragraph"
                  >
                    {paragraph}
                  </p>
                ))}
              </blockquote>
            )}
          </div>

          {/* The author band overlays the notch: the logo plate seats the bite,
              the name box follows it, all outside the shape so the cut can't
              crop them. */}
          <div className="partner-testimonial__author">
            {logo && (
              <div className="partner-testimonial__logo-box">
                <Image
                  src={logo.url}
                  alt={logo.altText ?? ''}
                  width={logo.width ?? 120}
                  height={logo.height ?? 50}
                  className="partner-testimonial__logo"
                  unoptimized={/\.svg(\?|$)/i.test(logo.url)}
                />
              </div>
            )}

            {(name || role) && (
              <div className="partner-testimonial__who">
                {name && (
                  <span className="partner-testimonial__name">{name}</span>
                )}
                {role && (
                  <span className="partner-testimonial__role">{role}</span>
                )}
              </div>
            )}

            <QuoteCloseIcon className="partner-testimonial__quote-mark partner-testimonial__quote-mark--close" />
          </div>
        </div>
      </div>
    </section>
  );
}
