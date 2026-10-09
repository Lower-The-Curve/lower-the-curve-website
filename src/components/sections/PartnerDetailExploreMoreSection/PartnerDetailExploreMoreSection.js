import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import './PartnerDetailExploreMoreSection.css';

export const PARTNER_DETAIL_EXPLORE_MORE_TYPE = 'partner_detail_explore_more';

const CARD_COUNT = 2;

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

function imageFrom(node, key) {
  return field(node, key)?.reference?.image ?? null;
}


function pathOf(url) {
  if (!url) return null;

  try {
    return new URL(url, 'https://placeholder.invalid').pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}


function tagStyle(tag) {
  const stops = ['color', 'color_3', 'color_end']
    .map((key) => fieldValue(tag, key))
    .filter(Boolean);

  const textColor = fieldValue(tag, 'text_color');

  if (!stops.length && !textColor) return undefined;

  return {
    ...(stops.length === 1
      ? { backgroundColor: stops[0] }
      : stops.length > 1
        ? { backgroundImage: `linear-gradient(135deg, ${stops.join(', ')})` }
        : {}),
    ...(textColor ? { color: textColor } : {}),
  };
}

function tagsOf(card) {
  return (field(card, 'tags')?.references?.nodes ?? [])
    .filter(Boolean)
    .map((tag) => ({
      id: tag.id ?? tag.handle,
      label: fieldValue(tag, 'label', 'name', 'title'),
      style: tagStyle(tag),
    }))
    .filter((tag) => tag.label);
}

function shuffled(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickCards(cards, partner, mode) {
  const ownCardId = field(partner, 'delivered_card')?.reference?.id ?? null;
  const ownHandle = field(partner, 'name')?.reference?.handle ?? null;
  const ownPath = ownHandle ? `/partners/${ownHandle}` : null;

  const eligible = (cards ?? []).filter(
    (card) =>
      card &&
      card.id !== ownCardId &&
      (!ownPath || pathOf(fieldValue(card, 'url', 'link')) !== ownPath) &&
      fieldValue(card, 'title')
  );

  const ordered =
    mode?.trim().toLowerCase() === 'random'
      ? shuffled(eligible)
      : [...eligible].sort(
          (a, b) => Date.parse(b.updatedAt ?? 0) - Date.parse(a.updatedAt ?? 0)
        );

  return ordered.slice(0, CARD_COUNT);
}

function ExploreMoreCard({ card, buttonText, buttonSolid, glow }) {
  const title = fieldValue(card, 'title');
  const description = fieldValue(card, 'description')?.trim();
  const url = fieldValue(card, 'url', 'link');
  const image = imageFrom(card, 'image');
  const tags = tagsOf(card);

  return (
    <li className="partner-explore-more__item">
      {glow && <span className="partner-explore-more__glow" aria-hidden="true" />}
      <article className="partner-explore-more__card">
        <div className="partner-explore-more__preview">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? title ?? ''}
              width={image.width ?? 1160}
              height={image.height ?? 560}
              className="partner-explore-more__image"
              sizes="(max-width: 575px) 100vw, 38vw"
              unoptimized={/\.svg(\?|$)/i.test(image.url)}
            />
          )}

          
          {tags.length > 0 && (
            <ul className="partner-explore-more__tags">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="partner-explore-more__tag"
                  style={tag.style}
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="partner-explore-more__body">
          <h3 className="partner-explore-more__card-title">{title}</h3>

          {description && (
            <p className="partner-explore-more__card-copy">{description}</p>
          )}

          {url && buttonText && (
            <Button
              href={url}
              variant={buttonSolid ? 'primary' : 'secondary'}
              className={
                buttonSolid
                  ? 'partner-explore-more__button partner-explore-more__button--solid'
                  : 'partner-explore-more__button partner-explore-more__button--outline'
              }
            >
              {buttonText}
            </Button>
          )}
        </div>
      </article>
    </li>
  );
}

export default function PartnerDetailExploreMoreSection({
  section,
  cards,
  partner,
}) {
  if (!section) return null;

  const picked = pickCards(cards, partner, fieldValue(section, 'selection_mode'));

  if (!picked.length) return null;

  const title = fieldValue(section, 'title');
  const buttonText = fieldValue(section, 'button_text', 'button_label');
  const buttonSolid =
    fieldValue(section, 'button_style', 'button_styles')
      ?.trim()
      .toLowerCase() === 'solid';

  return (
    <section className="partner-explore-more">
      <div className="partner-explore-more__inner">
        {title && (
          <h2 className="partner-explore-more__title">
            {accentedTitle(title, {
              accent: 'partner-explore-more__accent',
              blue: 'partner-explore-more__accent--blue',
              green: 'partner-explore-more__accent--green',
            })}
          </h2>
        )}

        <ul className="partner-explore-more__grid">
          {picked.map((card, index) => (
            <ExploreMoreCard
              key={card.id}
              card={card}
              buttonText={buttonText}
              buttonSolid={buttonSolid}
              glow={index === picked.length - 1}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
