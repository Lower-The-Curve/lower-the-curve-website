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

const THRESHOLD = 0.03;

const IOS_DECELERATION = 0.998;
const PROJECTION_MS = IOS_DECELERATION / (1 - IOS_DECELERATION);

// Shorter than the arrows' slide: on release the card has only the rest of its
// snap left, so the bar must move faster to keep up.
const SWIPE_SLIDE = '0.35s';

const SETTLE_MS = 150;

function cardStep(track) {
  const card = track.firstElementChild;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const width = card ? card.getBoundingClientRect().width + gap : 0;
  return width > 0 ? width : 320;
}

function geometry(track) {
  const max = track.scrollWidth - track.clientWidth;
  const distance = cardStep(track);
  const steps = Math.max(1, Math.ceil(max / distance - 0.01));
  const lastStart = (steps - 1) * distance;
  const toPosition = (left) => {
    const x = Math.min(Math.max(left, 0), max);
    return x <= lastStart
      ? x / distance
      : steps - 1 + (x - lastStart) / (max - lastStart || 1);
  };
  return { max, steps, toPosition };
}

export default function TestimonialsCarousel({ section }) {
  const trackRef = useRef(null);
  // The bar moves once per card via a CSS transition instead of following the
  // scroll: iPhone Safari reports scroll to JS late, so a tracking bar wobbles.
  const barRef = useRef(null);
  const frameRef = useRef(0);
  const indexRef = useRef(-1);
  const lastLeftRef = useRef(0);
  const stepsRef = useRef(1);
  const draggingRef = useRef(false);
  const samplesRef = useRef([]);
  const dragFromRef = useRef(0);
  const settleTimerRef = useRef(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  const placeBar = (index, steps) => {
    // Never restart a running slide — that is what makes the bar wobble.
    if (index === indexRef.current) return;
    indexRef.current = index;
    barRef.current?.style.setProperty('--progress', String(index / steps));
  };

  const readScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    // A 1px slack: sub-pixel layout can leave scrollWidth a hair over
    // clientWidth on a track that is not actually scrollable.
    const canScroll = max > 1;
    const left = Math.min(Math.max(track.scrollLeft, 0), max);
    setScrollable(canScroll);
    setAtStart(!canScroll || left <= 1);
    setAtEnd(!canScroll || left >= max - 1);
    if (!canScroll || !barRef.current) return;

    const { steps, toPosition } = geometry(track);
    stepsRef.current = steps;
    const position = toPosition(left);

    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      if (draggingRef.current) return;
      placeBar(Math.round(toPosition(track.scrollLeft)), steps);
    }, SETTLE_MS);

    const direction = left - lastLeftRef.current;
    lastLeftRef.current = left;

    if (draggingRef.current) {
      const now = performance.now();
      const samples = samplesRef.current;
      samples.push({ left, time: now });
      while (samples.length > 2 && now - samples[0].time > 100) samples.shift();
      return;
    }

    const current = indexRef.current;
    let index = current < 0 ? Math.round(position) : current;
    // Never step against the direction of travel (keeps arrow moves stable).
    if (direction > 0.5) {
      index = Math.ceil(position - THRESHOLD);
      if (current >= 0) index = Math.max(current, index);
    } else if (direction < -0.5) {
      index = Math.floor(position + THRESHOLD);
      if (current >= 0) index = Math.min(current, index);
    }
    placeBar(Math.min(steps, Math.max(0, index)), steps);
  }, []);

  const onScroll = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      readScroll();
    });
  }, [readScroll]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    readScroll();
    track.addEventListener('scroll', onScroll, { passive: true });

    const onTouchStart = () => {
      draggingRef.current = true;
      dragFromRef.current = indexRef.current < 0 ? 0 : indexRef.current;
      samplesRef.current = [{ left: track.scrollLeft, time: performance.now() }];
    };
    const onTouchEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (!barRef.current || track.scrollWidth - track.clientWidth <= 1) return;

      const left = track.scrollLeft;
      const now = performance.now();
      const samples = samplesRef.current;
      const first = samples[0];
      const last = samples[samples.length - 1];
      samplesRef.current = [];
      lastLeftRef.current = left;

      const elapsed = first ? now - first.time : 0;
      const velocity = elapsed > 0 ? (left - first.left) / elapsed : 0;
      const sinceMove = last ? now - last.time : Infinity;
      const coast = sinceMove > 150 ? 0 : velocity * PROJECTION_MS;

      const { steps, toPosition } = geometry(track);
      stepsRef.current = steps;
      const from = dragFromRef.current;
      const landing = Math.round(toPosition(left + coast));
      const index = Math.min(from + 1, Math.max(from - 1, landing));
      barRef.current.style.transitionDuration = SWIPE_SLIDE;
      placeBar(Math.min(steps, Math.max(0, index)), steps);
    };
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Card widths and the peek both change with the viewport, so the progress
    // bar has to be recomputed on resize, not just on scroll.
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
      observer.disconnect();
      clearTimeout(settleTimerRef.current);
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [readScroll, onScroll]);

  useEffect(() => {
    indexRef.current = -1;
    if (scrollable) readScroll();
  }, [scrollable, readScroll]);

  const step = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const steps = stepsRef.current;
    const from = indexRef.current < 0 ? 0 : indexRef.current;
    if (barRef.current) barRef.current.style.transitionDuration = '';
    placeBar(Math.min(steps, Math.max(0, from + direction)), steps);
    track.scrollBy({ left: direction * cardStep(track), behavior: 'smooth' });
  };

  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description', 'paragraph');
  const items = referencesFrom(section, 'testimonial', 'testimonials', 'items');
  if (!items.length) return null;

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
              <span className="testimonials__progress-bar" ref={barRef} />
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
