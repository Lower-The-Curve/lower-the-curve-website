"use client";

import { useState } from "react";
import Image from "next/image";
import accentedTitle from "@/components/ui/accentedTitle";
import "./ProjectRouteSection.css";

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
    const ref = field(node, key)?.reference;
    if (!ref) continue;
    if (ref.image) return ref.image;
    if (ref.url) {
      return {
        url: ref.url,
        altText: ref.alt ?? "",
        width: null,
        height: null,
      };
    }
  }
  return null;
}

export default function ProjectRouteTabs({ section }) {
  const [active, setActive] = useState(0);

  if (!section) return null;

  const title = fieldValue(section, "title");
  const description = fieldValue(section, "description");
  const grayGlow = imageFrom(section, "gray_bubble", "gray_glow");
  const greenGlow = imageFrom(section, "green_bubble", "green_glow");
  const steps = referencesFrom(section, "steps");
  const current = steps[active] ?? steps[0];
  const cards = current ? referencesFrom(current, "cards") : [];

  if (!steps.length) return null;

  return (
    <section className="project-route">
      {grayGlow && (
        <Image
          src={grayGlow.url}
          alt={grayGlow.altText ?? ""}
          width={grayGlow.width ?? 130}
          height={grayGlow.height ?? 157}
          className="project-route__glow"
          unoptimized={/\.svg(\?|$)/i.test(grayGlow.url)}
        />
      )}
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

        <div className="project-route__tabs" role="tablist">
          {steps.map((step, index) => {
            const label = fieldValue(step, "title");
            const isActive = index === active;

            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? "project-route__tab project-route__tab--active"
                    : "project-route__tab"
                }
                onClick={() => setActive(index)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <ul className="project-route__cards" role="tabpanel">
          {cards.map((card, index) => {
            const cardTitle = fieldValue(card, "title");
            const cardDescription = fieldValue(card, "description");
            const icon = imageFrom(card, "icon", "image");

            return (
              <li key={card.id} className="project-route__card">
                {index === 0 && greenGlow && (
                  <Image
                    src={greenGlow.url}
                    alt={greenGlow.altText ?? ""}
                    width={greenGlow.width ?? 30}
                    height={greenGlow.height ?? 30}
                    className="project-route__green-glow"
                    unoptimized={/\.svg(\?|$)/i.test(greenGlow.url)}
                  />
                )}
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
