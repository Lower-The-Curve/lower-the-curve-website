'use client';

// Client component: needs the DOM, canvas and timers. Renders nothing.
// Chrome and Safari never animate an SVG or GIF favicon themselves, so this
// cycles the <link rel="icon"> href through pre-rendered PNG frames.
//
// Every frame is public/favicon.svg (the static icon declared in the root
// layout's metadata) with its three arcs — ids inner, middle, outer — given an
// opacity and scale for that moment. The logo's colours live in that file only.
//
// The static icon stays up under reduced motion and while the tab is hidden
// (background timers are throttled to ~1/s, which would stutter). Safari ignores
// favicon changes, so it always shows the static icon.

import { useEffect } from 'react';

const SIZE = 64;
const FRAME_MS = 80;

// Innermost first. Every arc's foot rests on the baseline at the viewBox's
// bottom edge (y = 264).
const PIECES = ['inner', 'middle', 'outer'];
const BASELINE = 264;

// One loop plays two moves back to back, each followed by a rest.
// 1. Signal pulse: a dim ripples through the arcs, inner to outer.
const PULSE_MS = 2400;
const PULSE_START_MS = 350;
const PULSE_STAGGER_MS = 230;
const PULSE_HALF_WIDTH_MS = 350;
const PULSE_DEPTH = 0.75;

// 2. Lower the curve: the arcs are pressed onto the baseline, then spring back.
const SQUASH_MS = 2600;
const SQUASH_STAGGER_MS = 70;
const PRESS_MS = 380;
const RELEASE_AT_MS = 480;
const RELEASE_MS = 800;
const SQUASH_DEPTH = 0.4;

const CYCLE_MS = PULSE_MS + SQUASH_MS;

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

// 1 at x = 0, easing smoothly to 0 at |x| = 1.
function bump(x) {
  return Math.abs(x) >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * x));
}

function pulseOpacity(time, index) {
  const offset = time - PULSE_START_MS - index * PULSE_STAGGER_MS;
  return 1 - PULSE_DEPTH * bump(offset / PULSE_HALF_WIDTH_MS);
}

// 1 is fully pressed, 0 is at rest; it dips below 0 as the spring overshoots.
function squashAmount(time, index) {
  const local = time - index * SQUASH_STAGGER_MS;
  if (local < RELEASE_AT_MS) return easeInOutCubic(clamp(local / PRESS_MS));
  const u = clamp((local - RELEASE_AT_MS) / RELEASE_MS);
  return Math.exp(-6 * u) * Math.cos(2.5 * Math.PI * u) * (1 - u);
}

function pieceAt(time, index) {
  if (time < PULSE_MS) {
    return { opacity: pulseOpacity(time, index), scaleY: 1 };
  }
  return {
    opacity: 1,
    scaleY: 1 - SQUASH_DEPTH * squashAmount(time - PULSE_MS, index),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// Resolves to null when the icon isn't an SVG with the three arc ids.
async function renderFrames(source) {
  const svg = new DOMParser()
    .parseFromString(source, 'image/svg+xml')
    .documentElement;
  const pieces = PIECES.map((id) => svg.querySelector(`#${id}`));
  if (pieces.some((piece) => !piece)) return null;

  // Firefox draws an SVG with no intrinsic size onto a canvas as nothing.
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext('2d');
  const serializer = new XMLSerializer();
  const frames = [];

  for (let time = 0; time < CYCLE_MS; time += FRAME_MS) {
    pieces.forEach((piece, index) => {
      const { opacity, scaleY } = pieceAt(time, index);
      piece.setAttribute('opacity', opacity.toFixed(3));
      piece.setAttribute(
        'transform',
        `translate(0 ${BASELINE}) scale(1 ${scaleY.toFixed(4)}) translate(0 -${BASELINE})`
      );
    });

    const markup = serializer.serializeToString(svg);
    const image = await loadImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
    );
    context.clearRect(0, 0, SIZE, SIZE);
    context.drawImage(image, 0, 0, SIZE, SIZE);
    frames.push(canvas.toDataURL('image/png'));
  }

  return frames;
}

export default function FaviconAnimation() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const link = document.querySelector('link[rel~="icon"]');
    if (!link) return undefined;

    const staticHref = link.getAttribute('href');
    let frames = null;
    let timer = 0;
    let cancelled = false;

    // Queried every time: a route change can re-render the metadata <link>.
    const setIcon = (href) => {
      document.querySelectorAll('link[rel~="icon"]').forEach((icon) => {
        icon.setAttribute('href', href);
      });
    };

    const start = () => {
      if (!frames || timer || document.hidden) return;
      let index = 0;
      timer = setInterval(() => {
        setIcon(frames[index]);
        index = (index + 1) % frames.length;
      }, FRAME_MS);
    };

    const stop = () => {
      clearInterval(timer);
      timer = 0;
      setIcon(staticHref);
    };

    const onVisibilityChange = () => (document.hidden ? stop() : start());

    fetch(staticHref)
      .then((response) => response.text())
      .then(renderFrames)
      .then((rendered) => {
        if (cancelled || !rendered) return;
        frames = rendered;
        start();
      })
      // Any failure (a tainted canvas, a non-SVG icon) keeps the static icon.
      .catch(() => {});

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stop();
    };
  }, []);

  return null;
}
