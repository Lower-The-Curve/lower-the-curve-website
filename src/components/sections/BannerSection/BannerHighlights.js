'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

// The highlight list is a Client Component for one reason: how the labels fit
// has to be measured in the browser. Whether a label fits on one line depends on
// the live CMS text, the type size and the width the copy column has left — a
// stylesheet can't know any of that. The list still renders and reads fine
// without JS; the script only picks one of the three states below.
//
//   1. normal        — every label fits on one line at its own size.
//   2. --compact     — they do not fit, but they do one step smaller (the 14px
//                      UI token, nowrap). That is the narrow-desktop range,
//                      where the copy column has not reached its 712px measure
//                      yet and the 16px labels need ~717px.
//   3. --two-line    — no size fits, so ALL six wrap together at a word space.
//
// The states are BEM modifiers on the list — the stylesheet can't carry
// unprefixed `is-*` classes (one block per stylesheet, every class
// block-prefixed), and these are the same states.
const COMPACT = 'banner__highlights--compact';
const TWO_LINE = 'banner__highlights--two-line';

const LABEL = 'banner__highlight-label';

// Split a label before its last word. The tail is the part that drops to line
// two ("Seamless Integrations" -> "Seamless" / "Integrations"), marked up rather
// than measured per label so the break is always at a word space and never
// mid-word. A single-word label has no tail and simply stays one line.
function splitLabel(label) {
  const at = label.lastIndexOf(' ');
  return at === -1 ? [label, null] : [label.slice(0, at), label.slice(at + 1)];
}

// Does every label fit on one line at the size it is styled with right now?
// `nowrap` makes a label that does not fit overflow instead of wrapping, so
// scrollWidth is the full single-line text width. The writes and the read run in
// one frame, so the temporary style is never painted.
function fitsOneLine(labels) {
  labels.forEach((label) => {
    label.style.whiteSpace = 'nowrap';
  });

  const overflows = [...labels].some(
    (label) => label.scrollWidth > label.clientWidth + 1
  );

  labels.forEach((label) => {
    label.style.whiteSpace = '';
  });

  return !overflows;
}

export default function BannerHighlights({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    // The compact step is a desktop-layout device. On the phone/tablet layout
    // the type is already the smaller UI token, and the design asks for the
    // two-line group there rather than shrinking it further.
    const desktop = window.matchMedia('(min-width: 1025px)');

    const measure = () => {
      const labels = list.querySelectorAll(`.${LABEL}`);
      if (!labels.length) return;

      // 1. Does it fit at the size the label is styled with right now?
      list.classList.remove(COMPACT, TWO_LINE);
      if (fitsOneLine(labels)) return;

      // 2. Would it fit one step smaller? Shrinking the type is the last resort
      //    before wrapping.
      if (desktop.matches) {
        list.classList.add(COMPACT);
        if (fitsOneLine(labels)) return;
      }

      // 3. No size fits: the whole group takes the second line, never a mix.
      list.classList.remove(COMPACT);
      list.classList.add(TWO_LINE);
    };

    measure();

    // Re-evaluate when the width available to the list changes. The list itself
    // is NOT observed: toggling a state changes its height, which would feed
    // straight back into the observer. The parent column only changes height
    // when a state does, so height-only entries are ignored.
    let lastWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width === lastWidth) return;
      lastWidth = width;
      measure();
    });
    observer.observe(list.parentElement);

    // The webfont's metrics decide every measurement, so re-measure once
    // Poppins has actually loaded.
    document.fonts?.ready.then(measure);

    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={listRef} className="banner__highlights">
      {items.map((item) => {
        const [head, tail] = splitLabel(item.label);

        return (
          <li key={item.id} className="banner__highlight">
            {item.icon && (
              <Image
                src={item.icon.url}
                alt=""
                width={item.icon.width ?? 32}
                height={item.icon.height ?? 32}
                className="banner__highlight-icon"
                unoptimized={/\.svg(\?|$)/i.test(item.icon.url)}
              />
            )}
            <span className="banner__highlight-label">
              {head}
              {tail && (
                <>
                  {' '}
                  <span className="banner__highlight-tail">{tail}</span>
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
