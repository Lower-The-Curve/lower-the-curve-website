'use client';

// Client component: needs IntersectionObserver and requestAnimationFrame.
// Only "<text><whole number><text>" values animate ("50+", "120%"); anything
// else ("24/7", "1.5M") renders as typed. The server renders the final value.

import { useEffect, useRef, useState } from 'react';

const NUMBER = /^(\D*)(\d+)(\D*)$/;
const DURATION = 1400;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function StatCountUp({ value }) {
  const ref = useRef(null);
  const match = value.trim().match(NUMBER);
  const target = match ? Number(match[2]) : null;
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    const element = ref.current;
    if (!element || target === null) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    if (!('IntersectionObserver' in window)) return undefined;

    let frame = 0;
    setCurrent(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          setCurrent(Math.round(target * easeOutCubic(progress)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  if (!match) {
    return (
      <span className="stats-grid__value stats-grid__number">{value}</span>
    );
  }

  const [, prefix, , suffix] = match;

  // The final value sits invisibly underneath to fix the width, and is what
  // screen readers announce; the counting copy is hidden from them.
  return (
    <span ref={ref} className="stats-grid__value stats-grid__value--counting">
      <span className="stats-grid__value-final">{value.trim()}</span>
      <span
        className="stats-grid__value-live stats-grid__number"
        aria-hidden="true"
      >
        {prefix}
        {current}
        {suffix}
      </span>
    </span>
  );
}
