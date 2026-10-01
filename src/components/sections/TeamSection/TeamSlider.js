'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import './TeamSection.css';

// A Client Component because the row has state (which card is expanded) and
// pointer handling (drag to scroll). TeamSection stays a Server Component and
// hands this plain, serialisable member objects — the type constant lives there
// for the same reason it does in TestimonialsSection.
//
// The row is a native horizontally-scrolling list, so touch swipe, trackpad and
// keyboard scrolling work with no JS. The pointer handlers only add mouse drag.

// Pixels of travel before a press counts as a drag rather than a click.
const DRAG_THRESHOLD = 5;

// The first and last cards round on their outer side only (see TeamSection.css).
// A lone card is both, which would round neither — so it takes neither modifier
// and falls back to all four corners.
function cardClass(index, activeIndex, count) {
  const classes = ['team__card'];
  if (index === activeIndex) classes.push('team__card--active');
  if (count > 1 && index === 0) classes.push('team__card--first');
  if (count > 1 && index === count - 1) classes.push('team__card--last');
  return classes.join(' ');
}

export default function TeamSlider({ members }) {
  // The first card is expanded by default. Deliberately never reset on mouse
  // leave, so the last hovered card stays open.
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  const onPointerDown = (event) => {
    // Touch and pen already scroll natively.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: trackRef.current.scrollLeft,
    };
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state.active) return;

    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return;

    if (!state.moved) {
      state.moved = true;
      trackRef.current.setPointerCapture(event.pointerId);
    }
    trackRef.current.scrollLeft = state.startScroll - delta;
  };

  const endDrag = (event) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (trackRef.current.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <ul
      className="team__track"
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // Stops the browser starting a native image drag, which would swallow the
      // pointer events the slider is listening for.
      onDragStart={(event) => event.preventDefault()}
    >
      {members.map((member, index) => (
        <li
          key={member.id}
          // tabIndex + onFocus so keyboard users can expand a card too.
          tabIndex={0}
          className={cardClass(index, activeIndex, members.length)}
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          onClick={() => setActiveIndex(index)}
        >
          {member.photo && (
            <Image
              src={member.photo.url}
              alt={member.photo.altText || member.name || ''}
              width={400}
              height={500}
              sizes="(max-width: 575px) 70vw, 400px"
              className="team__photo"
            />
          )}

          {/* Two stacked overlays crossfaded by opacity — a gradient cannot be
              transitioned directly. */}
          <span className="team__shade" aria-hidden="true" />
          <span className="team__tint" aria-hidden="true" />

          <div className="team__caption">
            {member.name && <h3 className="team__name">{member.name}</h3>}
            {member.role && <p className="team__role">{member.role}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
