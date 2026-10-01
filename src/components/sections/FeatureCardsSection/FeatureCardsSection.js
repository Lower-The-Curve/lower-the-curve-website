import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import './FeatureCardsSection.css';

export const FEATURE_CARDS_TYPE = 'feature_cards';

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

function referencesFrom(node, ...keys) {
  for (const key of keys) {
    const nodes = field(node, key)?.references?.nodes;
    if (nodes?.length) return nodes;
  }
  return [];
}

// Icons resolve as a MediaImage, or as a GenericFile (url only) for some SVGs.
function iconFrom(node, ...keys) {
  for (const key of keys) {
    const reference = field(node, key)?.reference;
    if (reference?.image?.url) return reference.image;
    if (reference?.url) return { url: reference.url, altText: reference.alt };
  }
  return null;
}

export default function FeatureCardsSection({ section }) {
  if (!section) return null;

  const title = toggledOn(section, 'show_heading')
    ? fieldValue(section, 'title')
    : null;
  const cards = referencesFrom(section, 'cards');

  if (!cards.length) return null;

  return (
    <section className="feature-cards">
      <span className="feature-cards__glow" aria-hidden="true" />

      <div className="feature-cards__inner">
        {title && (
          <h2 className="feature-cards__title">
            {accentedTitle(title, {
              accent: 'feature-cards__accent',
              blue: 'feature-cards__accent--blue',
              green: 'feature-cards__accent--green',
            })}
          </h2>
        )}

        <ul className="feature-cards__list">
          {cards.map((card) => {
            const cardTitle = fieldValue(card, 'title');
            const cardDescription = fieldValue(card, 'description');
            const icon = iconFrom(card, 'icon');

            return (
              <li key={card.id} className="feature-cards__card">
                {/* Decorative: the title beside it already names the value. */}
                {icon && (
                  <Image
                    src={icon.url}
                    alt=""
                    width={icon.width ?? 56}
                    height={icon.height ?? 56}
                    className="feature-cards__icon"
                    unoptimized={/\.svg(\?|$)/i.test(icon.url)}
                  />
                )}

                <div className="feature-cards__body">
                  {cardTitle && (
                    <h3 className="feature-cards__card-title">{cardTitle}</h3>
                  )}
                  {cardDescription && (
                    <p className="feature-cards__description">
                      {cardDescription}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
