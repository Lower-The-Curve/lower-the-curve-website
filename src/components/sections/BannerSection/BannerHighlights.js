'use client';

import { useEffect, useRef } from 'react';

import Image from 'next/image';

const TWO_LINE = 'banner__highlights--two-line';
const LABEL = 'banner__highlight-label';

function splitLabel(label) {
  const at = label.lastIndexOf(' ');

  return at === -1 ? [label, null] : [label.slice(0, at), label.slice(at + 1)];
}

export default function BannerHighlights({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return undefined;

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

    let lastWidth = -1;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;

      if (width === lastWidth) return;

      lastWidth = width;
      measure();
    });

    observer.observe(list.parentElement);

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