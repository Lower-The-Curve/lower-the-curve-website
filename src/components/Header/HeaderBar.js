'use client';

import { useEffect, useRef, useState } from 'react';

// The <header> element itself. Client Component only so it can watch the scroll
// direction: scrolling down slides the header out of view, scrolling up brings
// it back. Everything inside it is still rendered by the Server Component in
// Header.js and passed through as children.

// Ignore scroll deltas smaller than this, so a trackpad's tiny jitters don't
// flicker the header in and out.
const SCROLL_THRESHOLD = 8;

export default function HeaderBar({ children }) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;

      // Always shown while it still covers its own spot at the top of the page
      // (and during iOS overscroll, where scrollY goes negative).
      if (y <= (ref.current?.offsetHeight ?? 0)) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (Math.abs(y - lastY) < SCROLL_THRESHOLD) return;
      setHidden(y > lastY);
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={ref} className={`site-header ${hidden ? 'site-header--hidden' : ''}`}>
      {children}
    </header>
  );
}
