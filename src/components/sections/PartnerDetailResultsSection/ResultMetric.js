'use client';


import { useEffect, useId, useRef, useState } from 'react';

const NUMBER = /^(\D*)(\d+)(\D*)$/;
const DURATION = 1400;

const RADIUS = 46;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function ResultMetric({ value, fill, showRing, animate }) {
  const ref = useRef(null);
  const gradientId = useId();
  const text = value.trim();
  const match = text.match(NUMBER);
  const target = match ? Number(match[2]) : null;
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (!animate || !element) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    if (!('IntersectionObserver' in window)) return undefined;

    let frame = 0;
    setProgress(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / DURATION, 1);
          setProgress(easeOutCubic(t));
          if (t < 1) frame = requestAnimationFrame(tick);
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
  }, [animate]);

  const counting = match && progress < 1;
  const live = counting
    ? `${match[1]}${Math.round(target * progress)}${match[3]}`
    : text;

  return (
    <div
      ref={ref}
      className={`partner-detail-results__metric${
        showRing ? ' partner-detail-results__metric--ring' : ''
      }`}
    >
      {showRing && (
        <svg
          className="partner-detail-results__ring"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle
            className="partner-detail-results__ring-track"
            cx="50"
            cy="50"
            r={RADIUS}
          />
          <circle
            className="partner-detail-results__ring-arc"
            cx="50"
            cy="50"
            r={RADIUS}
            pathLength="100"
            stroke={`url(#${gradientId})`}
            strokeDasharray="100 100"
            strokeDashoffset={100 - fill * 100 * progress}
          />
        </svg>
      )}

      <span className="partner-detail-results__value">
        <span
          className={`partner-detail-results__value-final${
            counting ? ' partner-detail-results__value-final--hidden' : ''
          }`}
        >
          {text}
        </span>
        {counting && (
          <span className="partner-detail-results__value-live" aria-hidden="true">
            {live}
          </span>
        )}
      </span>
    </div>
  );
}
