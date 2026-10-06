import Image from 'next/image';
import PartnerTestimonialShape from './PartnerTestimonialShape';
import { QuoteCloseIcon, QuoteOpenIcon } from './PartnerTestimonialQuotes';
import './PartnerTestimonialSection.css';

export const PARTNER_TESTIMONIAL_TYPE = 'teestimonial';

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

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
