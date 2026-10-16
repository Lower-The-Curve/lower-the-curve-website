'use client';

// The hero's "Scroll down" cue: smooth-scrolls to the section after the hero.
// The hero is a server component, so the click handler lives here. This renders
// the same `.hero__scroll` element the hero always had (no extra wrapper), so
// the layout is untouched. Figma has no prototype interaction on the cue; this
// is the standard behaviour for it.

export default function ScrollCue({ children }) {
  function scrollToNext(event) {
    const next = event.currentTarget.closest('section')?.nextElementSibling;
    if (!next) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <div
      className="hero__scroll"
      role="button"
      tabIndex={0}
      onClick={scrollToNext}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          scrollToNext(event);
        }
      }}
    >
      {children}
    </div>
  );
}
