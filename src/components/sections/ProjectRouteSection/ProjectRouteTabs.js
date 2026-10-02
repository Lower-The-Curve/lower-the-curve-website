"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

function intFrom(node, key, fallback) {
  const parsed = Number.parseInt(fieldValue(node, key) ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolFrom(node, key, fallback) {
  const value = fieldValue(node, key);
  if (value == null) return fallback;
  return value === "true";
}

export default function ProjectRouteTabs({ section }) {
  const glowLayout = (fieldValue(section, "glow_layout") ?? "default")
    .trim()
    .toLowerCase();
  const isSplit = glowLayout === "split";
  const steps = section ? referencesFrom(section, "steps") : [];
  const columns = Math.min(4, Math.max(2, intFrom(section, "columns", 2)));
  const showTabs = boolFrom(section, "show_tabs", true);
  const requested = intFrom(section, "default_tab", 1) - 1;
  const initial = steps.length
    ? Math.min(steps.length - 1, Math.max(0, requested))
    : 0;

  const [active, setActive] = useState(initial);
  const scrollerRef = useRef(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const tab = scroller.querySelector('[aria-selected="true"]');
    if (!tab) return;

    const tabs = tab.closest(".project-route__tabs");
    const indicator = tabs?.querySelector(".project-route__indicator");
    if (tabs && indicator) {
      const tabsBox = tabs.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      const center = tabBox.left - tabsBox.left + tabBox.width / 2;
      const pill = parseFloat(getComputedStyle(indicator).width);
      tabs.style.setProperty("--indicator-left", `${center - pill / 2}px`);
    }

    const tabLeft = tab.offsetLeft;
    const tabRight = tabLeft + tab.offsetWidth;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    if (tabLeft >= viewLeft && tabRight <= viewRight) return;

    const left = tabLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  if (!section || !steps.length) return null;

  const title = fieldValue(section, "title");
  const description = fieldValue(section, "description");
  const grayGlow = imageFrom(section, "gray_bubble", "gray_glow");
  const greenGlow = imageFrom(section, "green_bubble", "green_glow");
  const current = steps[active] ?? steps[0];
  const cards = current ? referencesFrom(current, "cards") : [];

  function onTabsKeyDown(event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (active + delta + steps.length) % steps.length;
    setActive(next);
    const tabs = scrollerRef.current?.querySelectorAll('[role="tab"]');
    tabs?.[next]?.focus();
  }

  return (
    <section
      className={
        isSplit ? "project-route project-route--split" : "project-route"
      }
    >
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
      {isSplit && greenGlow && (
        <Image
          src={greenGlow.url}
          alt={greenGlow.altText ?? ""}
          width={greenGlow.width ?? 220}
          height={greenGlow.height ?? 220}
          className="project-route__green-glow"
          unoptimized={/\.svg(\?|$)/i.test(greenGlow.url)}
        />
      )}
      <div className="project-route__inner">
        {(title || description) && (
          <div className="project-route__heading">
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
          </div>
        )}

        {showTabs && (
          <div className="project-route__scroller" ref={scrollerRef}>
            <div
              className="project-route__tabs"
              role="tablist"
              style={{
                "--tab-index": active,
                "--tab-count": steps.length,
              }}
              onKeyDown={onTabsKeyDown}
            >
              <span className="project-route__indicator" aria-hidden="true" />
              {steps.map((step, index) => {
                const label = fieldValue(step, "title");
                const isActive = index === active;

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
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
          </div>
        )}

        <ul
          className="project-route__cards"
          role="tabpanel"
          style={{ "--project-route-columns": columns }}
        >
          {cards.map((card, index) => {
            const cardTitle = fieldValue(card, "title");
            const cardDescription = fieldValue(card, "description");
            const icon = imageFrom(card, "icon", "image");

            return (
              <li key={card.id} className="project-route__card">
                {isSplit && index === 1 && grayGlow && (
                  <Image
                    src={grayGlow.url}
                    alt={grayGlow.altText ?? ""}
                    width={grayGlow.width ?? 130}
                    height={grayGlow.height ?? 157}
                    className="project-route__glow project-route__glow--card"
                    unoptimized={/\.svg(\?|$)/i.test(grayGlow.url)}
                  />
                )}
                {!isSplit && index === 0 && greenGlow && (
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
