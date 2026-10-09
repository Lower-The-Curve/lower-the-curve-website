import Image from "next/image";
import Link from "next/link";
import accentedTitle from "@/components/ui/accentedTitle";
import ArrowIcon from "@/components/ui/Button/ArrowIcon";
import "./DeliveredSection.css";

// The delivered section is a single `delivered` metaobject with:
//   - `title`       : single_line_text_field, the heading (accent markup)
//   - `description` : multi_line_text_field, the centred intro
//   - `link_label`  : single_line_text_field, the shared pill copy
//   - `cards`       : list.metaobject_reference -> delivered_card
//   - `selection_mode` : Manual | Latest | Random
//   - `card_details`   : Hover | Always visible
//   - `button_style`   : Outline | Solid
//
// Nested types (read through the reference lists, not dispatched on):
//   delivered_card  title, description, image, tags, url
//   service_tag     label, color, color_end, color_3
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/delivered.js.
export const DELIVERED_TYPE = "delivered";

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

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

function fileFrom(node, key) {
  return field(node, key)?.reference ?? null;
}

function cardsFrom(section) {
  return (
    field(section, "cards")?.references?.nodes ??
    section?.fields?.find((f) => f.references?.nodes?.length)?.references
      ?.nodes ??
    []
  );
}

function pathOf(url) {
  if (!url) return null;

  try {
    return (
      new URL(url, "https://placeholder.invalid").pathname.replace(/\/+$/, "") ||
      "/"
    );
  } catch {
    return null;
  }
}

function shuffled(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

const AUTO_MODES = new Set(["latest", "random"]);
const AUTO_CARD_COUNT = 2;

function pickCards(cards, partner, mode, count) {
  const ownCardId = field(partner, "delivered_card")?.reference?.id ?? null;
  const ownHandle = field(partner, "name")?.reference?.handle ?? null;
  const ownPath = ownHandle ? `/partners/${ownHandle}` : null;

  const eligible = (cards ?? []).filter(
    (card) =>
      card &&
      card.id !== ownCardId &&
      (!ownPath || pathOf(fieldValue(card, "url", "link")) !== ownPath) &&
      fieldValue(card, "title"),
  );

  const ordered =
    mode === "random"
      ? shuffled(eligible)
      : [...eligible].sort(
          (a, b) => Date.parse(b.updatedAt ?? 0) - Date.parse(a.updatedAt ?? 0),
        );

  return ordered.slice(0, count);
}

function selectCards(section, allCards, partner) {
  const mode = fieldValue(section, "selection_mode")?.trim().toLowerCase();
  const listed = cardsFrom(section);

  // An empty Manual list falls back to Latest.
  if (allCards && (AUTO_MODES.has(mode) || !listed.length)) {
    return pickCards(
      allCards,
      partner,
      AUTO_MODES.has(mode) ? mode : "latest",
      AUTO_CARD_COUNT,
    );
  }

  return listed;
}

function tagsFrom(card) {
  return field(card, "tags")?.references?.nodes ?? [];
}

// Shopify colour fields arrive as hex strings. Stops that are empty are omitted,
// so a two-stop tag and a three-stop tag share one painter.
function tagStyle(tag) {
  const stops = [
    fieldValue(tag, "color"),
    fieldValue(tag, "color_3"),
    fieldValue(tag, "color_end"),
  ].filter(Boolean);

  const textColor = fieldValue(tag, "text_color");

  if (!stops.length && !textColor) return undefined;

  return {
    ...(stops.length === 1
      ? { backgroundColor: stops[0] }
      : stops.length > 1
        ? {
            backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})`,
          }
        : {}),
    ...(textColor ? { color: textColor } : {}),
  };
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|#)/.test(url);
}

function CardShell({ href, hasCta, children }) {
  const className = [
    "delivered__card",
    href ? "delivered__card--linked" : "",
    hasCta ? "delivered__card--has-cta" : "delivered__card--no-cta",
  ]
    .filter(Boolean)
    .join(" ");

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function DeliveredCardItem({ card, linkLabel, solidCta, order }) {
  const cardTitle = fieldValue(card, "title");
  const cardDescription = fieldValue(card, "description");
  const url = fieldValue(card, "url", "link");
  const image = imageFrom(card, "image");
  const tags = tagsFrom(card);

  return (
    <li className="delivered__item" style={{ order }}>
      <CardShell href={url} hasCta={Boolean(url && linkLabel)}>
        <div className="delivered__preview">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? cardTitle ?? ""}
              width={image.width ?? 1160}
              height={image.height ?? 560}
              className="delivered__image"
              sizes="(max-width: 1024px) 100vw, 38vw"
              unoptimized={/\.svg(\?|$)/i.test(image.url)}
            />
          )}

          {tags.length > 0 && (
            <ul className="delivered__tags">
              {tags.map((tag) => {
                const label = fieldValue(tag, "label");
                if (!label) return null;

                return (
                  <li
                    key={tag.id ?? tag.handle}
                    className="delivered__tag"
                    style={tagStyle(tag)}
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {(cardTitle || cardDescription || (url && linkLabel)) && (
          <div className="delivered__panel">
            <div className="delivered__panel-inner">
              {cardTitle && (
                <h3 className="delivered__card-title">{cardTitle}</h3>
              )}
              {cardDescription && (
                <p className="delivered__card-copy">{cardDescription}</p>
              )}
              {url && linkLabel && (
                <span
                  className={
                    solidCta
                      ? "btn btn--primary delivered__cta delivered__cta--solid"
                      : "btn btn--primary delivered__cta delivered__cta--outline"
                  }
                >
                  <span className="btn__label">{linkLabel}</span>
                  <ArrowIcon
                    gradient={!solidCta}
                    className="btn__arrow btn__arrow--rise"
                  />
                </span>
              )}
            </div>
          </div>
        )}
      </CardShell>
    </li>
  );
}

function cardsByColumn(cards) {
  const columns = [[], []];
  cards.forEach((card, index) => {
    columns[index % 2].push({ card, index });
  });
  return columns;
}

export default function DeliveredSection({ section, allCards, partner }) {
  if (!section) return null;

  const title = fieldValue(section, "title");
  const description = fieldValue(section, "description");
  const linkLabel = fieldValue(section, "link_label", "button_text");
  const cards = selectCards(section, allCards, partner);
  const alwaysOpen =
    fieldValue(section, "card_details")?.trim().toLowerCase() ===
    "always visible";
  const solidCta =
    fieldValue(section, "button_style")?.trim().toLowerCase() === "solid";
  const greenGlow = fileFrom(section, "green_glow");
  const blueGlow = fileFrom(section, "blue_glow");
  if (!cards.length) return null;

  return (
    <section className={alwaysOpen ? "delivered delivered--open" : "delivered"}>
      {greenGlow?.image && (
        <Image
          src={greenGlow.image.url}
          alt=""
          width={greenGlow.image.width ?? 300}
          height={greenGlow.image.height ?? 300}
          className="delivered__glow"
          aria-hidden="true"
          unoptimized
        />
      )}
      {blueGlow?.image && (
        <Image
          src={blueGlow.image.url}
          alt=""
          width={blueGlow.image.width ?? 300}
          height={blueGlow.image.height ?? 300}
          className="delivered__blue-glow"
          aria-hidden="true"
          unoptimized
        />
      )}
      <div className="delivered__inner">
        {(title || description) && (
          <div className="delivered__intro">
            {title && (
              <h2 className="delivered__title">
                {accentedTitle(title, {
                  accent: "delivered__accent",
                  blue: "delivered__accent--blue",
                  green: "delivered__accent--green",
                })}
              </h2>
            )}
            {description && <p className="delivered__lede">{description}</p>}
          </div>
        )}

        <div className="delivered__grid">
          {cardsByColumn(cards).map((column, columnIndex) => (
            <ul key={columnIndex} className="delivered__column">
              {column.map(({ card, index }) => (
                <DeliveredCardItem
                  key={card.id}
                  card={card}
                  linkLabel={linkLabel}
                  solidCta={solidCta}
                  order={index}
                />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
