import Image from "next/image";
import accentedTitle from "@/components/ui/accentedTitle";
import {
  PROJECT_ROUTE_TYPE,
  projectRouteSectionFragment,
} from "./project-route.shared";

export { PROJECT_ROUTE_TYPE, projectRouteSectionFragment };

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

function referencesFrom(node, ...keys) {
  for (const key of keys) {
    const nodes = field(node, key)?.references?.nodes;
    if (nodes?.length) return nodes;
  }
  return [];
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

export default function ProjectRouteSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, "title");
  const description = fieldValue(section, "description");
  const steps = referencesFrom(section, "steps");
  const first = steps[0];
  const cards = first ? referencesFrom(first, "cards") : [];

  if (!steps.length) return null;

  return (
    <section className="project-route">
      <div className="project-route__inner">
        {title && (
          <h2 className="project-route__title">
            {accentedTitle(title, {
              accent: "project-route__accent",
              blue: "project-route__accent--blue",
            })}
          </h2>
        )}
        {description && (
          <p className="project-route__description">{description}</p>
        )}
        <ul className="project-route__cards">
          {cards.map((card) => {
            const cardTitle = fieldValue(card, "title");
            const cardDescription = fieldValue(card, "description");
            const icon = imageFrom(card, "icon", "image");

            return (
              <li key={card.id} className="project-route__card">
                {icon && (
                  <Image
                    src={icon.url}
                    alt={icon.altText ?? ""}
                    width={icon.width ?? 85}
                    height={icon.height ?? 85}
                    className="project-route__icon"
                    unoptimized={/\.svg(\?|$)/i.test(icon.url)}
                  />
                )}
                {cardTitle && (
                  <h3 className="project-route__card-title">{cardTitle}</h3>
                )}
                {cardDescription && (
                  <p className="project-route__card-description">
                    {cardDescription}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
