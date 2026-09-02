'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import './HeaderNav.css';

// The nav list plus the CTA. Client Component because the menu collapses at
// <= 1024px into a full-height drawer that slides in from the left — the
// desktop layout itself needs no JS.
//
// One markup tree serves both: on desktop `.nav` is an inline row inside the
// capsule; on mobile the same element is fixed-positioned as the drawer, the
// hamburger moves to the left of the logo, and the X inside the drawer closes it.
export default function HeaderNav({ items, cta, ctaBackground, ctaLabel }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // A full-height drawer over the page shouldn't leave the page scrolling behind it.
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Colours come from Shopify, so they arrive as custom properties rather than a
  // class. Omitted keys fall back to the defaults in Button.css.
  const ctaStyle = {};
  if (ctaBackground) ctaStyle['--btn-bg'] = ctaBackground;
  if (ctaLabel) ctaStyle['--btn-fg'] = ctaLabel;

  return (
    <>
      <button
        type="button"
        className="site-nav__toggle"
        aria-expanded={open}
        aria-controls="main-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span className="site-nav__toggle-bar" />
        <span className="site-nav__toggle-bar" />
        <span className="site-nav__toggle-bar" />
      </button>

      <nav
        id="main-menu"
        className={`site-nav ${open ? 'site-nav--open' : ''}`}
        aria-label="Main menu"
      >
        {/* Drawer-only control; display:none on desktop, where the nav is inline. */}
        <button
          type="button"
          className="site-nav__close"
          aria-label="Close menu"
          onClick={close}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        <ul className="site-nav__menu">
          {items.map((item) => (
            <li key={item.id} className="site-nav__item">
              <Link href={item.path} className="site-nav__link" onClick={close}>
                {item.title}
              </Link>

              {item.items.length > 0 && (
                <ul className="site-nav__submenu">
                  {item.items.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={sub.path}
                        className="site-nav__sublink"
                        onClick={close}
                      >
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {cta && (
          <Button
            href={cta.url}
            variant="solid"
            arrow="none"
            style={ctaStyle}
            className="site-nav__cta"
            onClick={close}
          >
            {cta.text}
          </Button>
        )}
      </nav>

      {/* Tap-outside-to-close. Escape and the X button cover keyboard users, so
          this stays unfocusable rather than becoming a fake button. */}
      <div
        className={`site-nav__scrim ${open ? 'site-nav__scrim--open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
    </>
  );
}
