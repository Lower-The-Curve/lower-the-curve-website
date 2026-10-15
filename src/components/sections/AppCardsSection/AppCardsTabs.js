"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import accentedTitle from "@/components/ui/accentedTitle";
import Button from "@/components/ui/Button/Button";
import AppCardDialog from "./AppCardDialog";
import "./AppCardsSection.css";

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

function popupIdFor(card) {
  for (const key of ["button1", "button"]) {
    const id = field(card, key)?.reference?.id;
    if (id) return id;
  }
  return null;
}

function ExpandIcon() {
  return (
    <svg
      className="app-cards__card-expand-icon"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.66677 2.53333H3.70677C3.10938 2.53333 2.81046 2.53333 2.58229 2.64959C2.38159 2.75186 2.21852 2.91492 2.11626 3.11563C2 3.3438 2 3.64271 2 4.2401V8.29344C2 8.89083 2 9.18937 2.11626 9.41754C2.21852 9.61824 2.38159 9.78159 2.58229 9.88385C2.81024 10 3.1088 10 3.70502 10H7.76165C8.35787 10 8.656 10 8.88394 9.88385C9.08465 9.78159 9.24826 9.61809 9.35052 9.41738C9.46667 9.18943 9.46667 8.8912 9.46667 8.29498V7.33333M7.33333 2H10V4.66667M10 2L6.26667 5.73333"
        stroke="currentColor"
        strokeWidth="1.06667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AppCardsTabs({ section, popups }) {
  const steps = section ? referencesFrom(section, "steps") : [];
  const columns = Math.min(4, Math.max(2, intFrom(section, "columns", 2)));
  const showTabs = boolFrom(section, "show_tabs", true);
  const requested = intFrom(section, "default_tab", 1) - 1;
  const initial = steps.length
    ? Math.min(steps.length - 1, Math.max(0, requested))
    : 0;

  const [active, setActive] = useState(initial);
  const [activeCardId, setActiveCardId] = useState(null);
  const scrollerRef = useRef(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const tab = scroller.querySelector('[aria-selected="true"]');
    if (!tab) return;

    const tabs = tab.closest(".app-cards__tabs");
    const indicator = tabs?.querySelector(".app-cards__indicator");
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

  const popupsById = {};
  for (const popup of popups ?? []) popupsById[popup.id] = popup;

  const popupFor = (card) => popupsById[popupIdFor(card)] ?? null;

  const allCards = steps.flatMap((step) => referencesFrom(step, "cards"));
  const cardsById = {};
  for (const card of allCards) cardsById[card.id] = card;

  const activeCard = activeCardId ? cardsById[activeCardId] ?? null : null;

  let viewMore = [];
  if (activeCard) {
    const index = allCards.findIndex((card) => card.id === activeCard.id);
    if (index >= 0) {
      const seen = new Set([activeCard.id]);
      for (
        let step = 1;
        step <= allCards.length && viewMore.length < 3;
        step++
      ) {
        const card = allCards[(index + step) % allCards.length];
        if (seen.has(card.id)) continue;
        seen.add(card.id);
        viewMore.push(card);
      }
    }
  }

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
    <section className="app-cards">
      <div className="app-cards__inner">
        {grayGlow && (
          <Image
            src={grayGlow.url}
            alt={grayGlow.altText ?? ""}
            width={grayGlow.width ?? 130}
            height={grayGlow.height ?? 157}
            className="app-cards__glow app-cards__glow--gray"
            unoptimized={/\.svg(\?|$)/i.test(grayGlow.url)}
          />
        )}
        {greenGlow && (
          <Image
            src={greenGlow.url}
            alt={greenGlow.altText ?? ""}
            width={greenGlow.width ?? 30}
            height={greenGlow.height ?? 30}
            className="app-cards__glow app-cards__glow--green"
            unoptimized={/\.svg(\?|$)/i.test(greenGlow.url)}
          />
        )}

        {(title || description) && (
          <div className="app-cards__heading">
            {title && (
              <h2 className="app-cards__title">
                {accentedTitle(title, {
                  accent: "app-cards__accent",
                  blue: "app-cards__accent--blue",
                })}
              </h2>
            )}
            {description && (
              <p className="app-cards__description">{description}</p>
            )}
          </div>
        )}

        {showTabs && (
          <div className="app-cards__scroller" ref={scrollerRef}>
            <div
              className="app-cards__tabs"
              role="tablist"
              style={{
                "--tab-index": active,
                "--tab-count": steps.length,
              }}
              onKeyDown={onTabsKeyDown}
            >
              <span className="app-cards__indicator" aria-hidden="true" />
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
                        ? "app-cards__tab app-cards__tab--active"
                        : "app-cards__tab"
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
          className="app-cards__grid"
          role="tabpanel"
          style={{ "--app-cards-columns": columns }}
        >
          {cards.map((card) => {
            const cardTitle = fieldValue(card, "title");
            const cardDescription = fieldValue(card, "description");
            const icon = imageFrom(card, "icon", "image");
            const popup = popupFor(card);
            const showButton = boolFrom(card, "show_button", true);

            return (
              <li key={card.id} className="app-cards__card">
                {icon && (
                  <Image
                    src={icon.url}
                    alt={icon.altText ?? ""}
                    width={icon.width ?? 560}
                    height={icon.height ?? 560}
                    className="app-cards__icon"
                    unoptimized={/\.svg(\?|$)/i.test(icon.url)}
                  />
                )}
                <div className="app-cards__card-body">
                  {cardTitle && (
                    <h3 className="app-cards__card-title">{cardTitle}</h3>
                  )}
                  {cardDescription && (
                    <p className="app-cards__card-description">
                      {cardDescription}
                    </p>
                  )}
                  {showButton && (
                    <Button
                      className="app-cards__card-button"
                      variant="primary"
                      arrow="diagonal"
                      size="md"
                      aria-haspopup="dialog"
                      onClick={() => {
                        if (popup) setActiveCardId(card.id);
                      }}
                    >
                      Learn More
                    </Button>
                  )}
                </div>
                {showButton && (
                  <button
                    type="button"
                    className="app-cards__card-expand"
                    aria-label={
                      cardTitle
                        ? `Learn more about ${cardTitle}`
                        : "Learn more"
                    }
                    aria-haspopup="dialog"
                    onClick={() => {
                      if (popup) setActiveCardId(card.id);
                    }}
                  >
                    <ExpandIcon />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <AppCardDialog
        card={activeCard}
        popup={activeCard ? popupFor(activeCard) : null}
        viewMore={viewMore}
        onSelectCard={setActiveCardId}
        onDismiss={() => setActiveCardId(null)}
      />
    </section>
  );
}
