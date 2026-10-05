import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import ResultMetric from './ResultMetric';
import './PartnerDetailResultsSection.css';

export const PARTNER_DETAIL_RESULTS_TYPE = 'partner_detail_results';

const DEFAULT_RING_FILL = 0.75;

const PARTNER_TOKEN = /\{partner\}/gi;

const ACCENT_CLASSES = {
  accent: 'partner-detail-results__accent',
  blue: 'partner-detail-results__accent--blue',
  green: 'partner-detail-results__accent--green',
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

function iconFrom(node, ...keys) {
  for (const key of keys) {
    const reference = field(node, key)?.reference;

    if (reference?.image?.url) return reference.image;
    if (reference?.url) return { url: reference.url };
  }

  return null;
}

function ringFillFrom(node) {
  const parsed = Number.parseInt(fieldValue(node, 'ring_fill') ?? '', 10);

  if (!Number.isFinite(parsed)) return DEFAULT_RING_FILL;

  return Math.min(100, Math.max(0, parsed)) / 100;
}

export function partnerNameOf(partnerDetail) {
  return fieldValue(field(partnerDetail, 'name')?.reference, 'name', 'title');
}

function withPartner(text, partnerName) {
  return text.replace(PARTNER_TOKEN, partnerName ?? '');
}

function resultItems(section) {
  const nodes = field(section, 'results')?.references?.nodes ?? [];

  return nodes
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      value: fieldValue(node, 'value'),
      title: fieldValue(node, 'title'),
      description: fieldValue(node, 'description'),
      icon: iconFrom(node, 'icon'),
      fill: ringFillFrom(node),
    }))
    .filter((result) => result.value || result.title);
}

export default function PartnerDetailResultsSection({ section, partnerName }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = paragraphs(
    withPartner(fieldValue(section, 'description') ?? '', partnerName)
  );
  const results = resultItems(section);
  const animate = toggledOn(section, 'animate_on_scroll');
  const showRings = toggledOn(section, 'show_rings');
  const mobileTwo = fieldValue(section, 'mobile_columns')?.trim() === '2';

  if (!title && !description.length && !results.length) return null;

  return (
    <section
      className={`partner-detail-results${
        mobileTwo ? ' partner-detail-results--mobile-two' : ''
      }`}
    >
      <div className="partner-detail-results__inner">
        {(title || description.length > 0) && (
          <div className="partner-detail-results__intro">
            {title && (
              <h2 className="partner-detail-results__title">
                {accentedTitle(withPartner(title, partnerName), ACCENT_CLASSES)}
              </h2>
            )}

            {description.map((text, i) => (
              <p key={i} className="partner-detail-results__description">
                {text}
              </p>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="partner-detail-results__grid-wrap">
            <span className="partner-detail-results__sphere" aria-hidden="true" />

            <ul className="partner-detail-results__grid">
              {results.map((result) => (
                <li key={result.id} className="partner-detail-results__card">
                  <div className="partner-detail-results__card-head">
                    {result.value && (
                      <ResultMetric
                        value={result.value}
                        fill={result.fill}
                        showRing={showRings}
                        animate={animate}
                      />
                    )}

                    {/* Decorative: the title beside it names the result. */}
                    {result.icon && (
                      <Image
                        src={result.icon.url}
                        alt=""
                        width={result.icon.width ?? 50}
                        height={result.icon.height ?? 50}
                        className="partner-detail-results__icon"
                        unoptimized={/\.svg(\?|$)/i.test(result.icon.url)}
                      />
                    )}
                  </div>

                  {result.title && (
                    <h3 className="partner-detail-results__card-title">
                      {result.title}
                    </h3>
                  )}

                  {result.description && (
                    <p className="partner-detail-results__card-description">
                      {result.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
