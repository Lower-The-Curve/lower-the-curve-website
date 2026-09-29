'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

// The highlight list is a Client Component for one reason: the labels switch to
// two lines as a GROUP, which has to be measured in the browser. Whether a label
// fits on one line depends on the live CMS text, the phone/desktop type size and
// the width the copy column has left — a stylesheet can't know any of that. The
// list still renders and reads fine without JS; the only thing the script adds is
// making the switch happen for all six labels at once, in either direction.
//
// The state is a BEM modifier on the list, `banner__highlights--two-line` — the
// stylesheet can't carry an unprefixed `is-two-line` class (one block per
// stylesheet, every class block-prefixed), and this is the same state.
const TWO_LINE = 'banner__highlights--two-line';

// What the label element is called in the stylesheet.
const LABEL = 'banner__highlight-label';

// Split a label before its last word. The tail is the part that drops to line
// two ("Seamless Integrations" -> "Seamless" / "Integrations"), marked up rather
// than measured per label so the break is always at a word space and never
// mid-word. A single-word label has no tail and simply stays one line.
function splitLabel(label) {
  const at = label.lastIndexOf(' ');
  return at === -1 ? [label, null] : [label.slice(0, at), label.slice(at + 1)];
}

export default function BannerHighlights({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    // Measure the labels as if they were on ONE line: the forced break is made
    // neutral and `nowrap` stops a label wrapping under the measurement, so
    // scrollWidth is the full single-line text width. If any label no longer
    // fits its own box the whole list goes two-line. The writes and reads run in
    // one frame, so the temporary styles are never painted.
    const measure = () => {
      const labels = list.querySelectorAll(`.${LABEL}`);
      if (!labels.length) return;

      list.classList.remove(TWO_LINE);
      labels.forEach((label) => {
        label.style.whiteSpace = 'nowrap';
      });

      const overflows = [...labels].some(
        (label) => label.scrollWidth > label.clientWidth + 1
      );

      labels.forEach((label) => {
        label.style.whiteSpace = '';
      });
      list.classList.toggle(TWO_LINE, overflows);
    };

    measure();

    // Re-evaluate when the width available to the list changes. The list itself
    // is NOT observed: toggling the state changes its height, which would feed
    // straight back into the observer. The parent column only changes height
    // when the toggle does, so height-only entries are ignored.
    let lastWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width === lastWidth) return;
      lastWidth = width;
      measure();
    });
    observer.observe(list.parentElement);

    // The webfont's metrics decide every measurement, so re-measure once Poppins
    // has actually loaded.
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
