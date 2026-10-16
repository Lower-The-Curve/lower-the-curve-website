'use client';

// Client component: needs IntersectionObserver. The server renders the chart in
// its final state; once mounted this arms the entrance animation (rows hidden)
// and releases it when the chart scrolls into view. Reduced-motion users and
// browsers without IntersectionObserver never get armed, so they see the chart
// as rendered.

import { useEffect, useRef } from 'react';

export default function MetricsReveal({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    if (!('IntersectionObserver' in window)) return undefined;

    element.classList.add('case-study-metrics__chart--armed');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        element.classList.add('case-study-metrics__chart--revealed');
      },
      { threshold: 0.25 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
