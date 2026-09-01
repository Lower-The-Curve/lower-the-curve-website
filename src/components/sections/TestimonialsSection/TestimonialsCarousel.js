'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CardShape, { CARD_CLIP_PATH } from './CardShape';
import QuoteMark from './QuoteMark';
import './TestimonialsSection.css';

// A Client Component — the second on the site, after HeaderNav's mobile drawer.
// The carousel needs state and a scroll listener, which is the one case the
// conventions allow 'use client' for. Every section component other than this
// one is a Server Component.
//
// The carousel is a native horizontally-scrolling list with CSS scroll-snap, not
// a JS-driven slider. That means it already works by touch swipe, trackpad,
// keyboard and screen reader before any of this code runs — the arrows and the
// progress bar are enhancements on top of a scroll container, not the mechanism.

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

// The design accents two words of the heading ("love", "us") in the brand
// gradient. Which words those are is editorial, so they are authored in the
// metafield as HTML spans rather than matched by word here. Parsed, never
// injected: only a <span> whose class is in ACCENT_CLASSES becomes an element, so
// a stray tag or a pasted <script> stays literal text.
const ACCENT_CLASSES = {
  'blue-gradient': 'testimonials__accent--blue',
  'green-gradient': 'testimonials__accent--green',
};

const ACCENT_SPAN =
  /<span\b[^>]*\bclass=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>/gi;

function accentedTitle(title) {
  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(ACCENT_SPAN)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));

    const accent = match[1]
      .split(/\s+/)
      .map((name) => ACCENT_CLASSES[name])
      .find(Boolean);

    parts.push(
      accent ? (
        <span key={match.index} className={`testimonials__accent ${accent}`}>
          {match[2]}
        </span>
      ) : (
        match[2]
      )
    );

    cursor = match.index + match[0].length;
  }

  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}

export default function TestimonialsCarousel({ section }) {
  const trackRef = useRef(null);
  // 0 while unscrolled, 1 at the end. Drives the progress bar's width and
  // whether each arrow is disabled.
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  const readScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    // A 1px slack: sub-pixel layout can leave scrollWidth a hair over
    // clientWidth on a track that is not actually scrollable.
    setScrollable(max > 1);
    setProgress(max > 1 ? track.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    readScroll();
    track.addEventListener('scroll', readScroll, { passive: true });

    // Card widths and the peek both change with the viewport, so the progress
    // bar has to be recomputed on resize, not just on scroll.
    const observer = new ResizeObserver(readScroll);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', readScroll);
      observer.disconnect();
    };
  }, [readScroll]);

  // One card plus its gap, read off the DOM rather than hardcoded, so the arrows
  // stay in step with whatever the CSS is doing at this breakpoint.
  const step = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = card ? card.getBoundingClientRect().width + gap : 320;
    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description', 'paragraph');
  const items = referencesFrom(section, 'testimonial', 'testimonials', 'items');
  if (!items.length) return null;

  const atStart = progress <= 0.001;
  const atEnd = progress >= 0.999;

  return (
    <section className="testimonials">
      {/* The clip path every card references. Declared once per section: the id
          would resolve to the first definition anyway, so one is all there is. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath
            id="ltcTestimonialCardClip"
            clipPathUnits="objectBoundingBox"
          >
            <path d={CARD_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div className="testimonials__inner">
        <div className="testimonials__intro">
          {title && <h2 className="testimonials__title">{accentedTitle(title)}</h2>}
          {description && <p className="testimonials__description">{description}</p>}

        </div>

        {/* Hidden entirely when everything already fits — a control that can
            never do anything is worse than no control.
            A SIBLING of .intro, not a child of it: the reference puts the
            controls under the CARDS on narrow, and only a grid item of .inner
            can be reordered past the track. */}
        {scrollable && (
          <div className="testimonials__controls">
            <button
              type="button"
              className="testimonials__arrow"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label="Previous testimonial"
            >
              <ArrowGlyph direction="left" />
            </button>

            {/* Presentational: the real position is conveyed by the scroll
                container itself, which assistive tech already reports. */}
            <div className="testimonials__progress" aria-hidden="true">
              <span
                className="testimonials__progress-bar"
                style={{ '--progress': progress }}
              />
            </div>

            <button
              type="button"
              className="testimonials__arrow"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label="Next testimonial"
            >
              <ArrowGlyph direction="right" />
            </button>
          </div>
        )}

        {/* tabIndex 0 so the track is keyboard-scrollable — a scroll container
            holding focusable children is reachable, but one holding only text
            would not be. */}
        <ul
          className="testimonials__track"
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label="Testimonials"
        >
          {items.map((item) => {
            const quote = fieldValue(item, 'quote', 'text', 'description');
            const name = fieldValue(item, 'name', 'author');
            const company = fieldValue(item, 'company', 'role', 'position');
            const logo = imageFrom(item, 'company_logo', 'logo', 'image');

            return (
              // The plate is a SIBLING of the clipped card, not a child of it:
              // clip-path clips descendants, so a plate inside would be cut away
              // by the very notch it fills — and the name beside it with it.
              <li key={item.id} className="testimonials__card-wrap">
                <div className="testimonials__card">
                  <CardShape className="testimonials__shape" />

                  <QuoteMark className="testimonials__quote-mark testimonials__quote-mark--open" />

                  {quote && (
                    <blockquote className="testimonials__quote">{quote}</blockquote>
                  )}

                  <div className="testimonials__author">
                    {(name || company) && (
                      <div className="testimonials__who">
                        {name && <span className="testimonials__name">{name}</span>}
                        {company && (
                          <span className="testimonials__company">{company}</span>
                        )}
                      </div>
                    )}

                    {/* Level with the name and hard against the card's right
                        edge, as the reference shows. */}
                    <QuoteMark className="testimonials__quote-mark testimonials__quote-mark--close" />
                  </div>
                </div>

                {logo && (
                  <div className="testimonials__logo-box">
                    <Image
                      src={logo.url}
                      alt={logo.altText ?? ''}
                      width={logo.width ?? 120}
                      height={logo.height ?? 50}
                      className="testimonials__logo"
                      unoptimized={/\.svg(\?|$)/i.test(logo.url)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// The carousel's chevrons. Not the shared Button's arrow: that one is a
// horizontal shaft with a head, this is a bare chevron, and it is an icon button
// rather than a pill.
function ArrowGlyph({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`testimonials__glyph testimonials__glyph--${direction}`}
    >
      <path d="M15 4L7 12l8 8" />
    </svg>
  );
}
