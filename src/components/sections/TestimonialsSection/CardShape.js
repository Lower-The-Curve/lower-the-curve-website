// The testimonial card's outline: a rounded rectangle with a NOTCH cut out of the
// bottom-left — 36.667% of the width by 20% of the height. That bite is the seat
// the logo plate sits in; the plate does not overlap the card, it fills the cut.
//
// THE NOTCH IS 20% TALL, NOT THE DESIGN FRAME'S 25%. On the 525x350 frame those
// are the same thing at 87.5px, but the real card is taller than 350 — 442px at
// 1440 — and a fraction of a taller card is a taller notch: 25% came out at 110px
// and visibly squeezed the quote above it. 20% lands at ~88px on the real card,
// which is the design's absolute size. It cannot be pinned in px: an
// objectBoundingBox clip only speaks in fractions, which is the trade for a card
// whose height follows its content.
//
// WHY THIS IS NOT `clip-path: path(...)`.
// Design's CSS was a `path()`, and `path()` takes ABSOLUTE user units — it cannot
// scale. Using it locks the card to exactly 525x350, and anything past those
// coordinates is clipped away rather than growing the box. Measured with the real
// copy: a six-line quote overflowed the 350px box by 27px and lost its last line.
// A card whose height is set by its content therefore has to clip against an SVG
// clipPath in `objectBoundingBox` units, which is the same outline expressed as
// fractions of whatever box the card ends up being.
//
// The one cost: the corner arcs go slightly elliptical when the card is not
// 525:350, since each axis scales independently. At the real sizes that is a
// couple of pixels on a 23.78px radius.
//
// TWO PIECES, kept in step:
//   CARD_CLIP_PATH — the outline in objectBoundingBox units (0-1), used by CSS
//     `clip-path` on the card. Clipping the ELEMENT is what makes the notch cut
//     the card's background and its backdrop-filter, not just paint a shape
//     behind them.
//   <CardShape />  — draws the edge along the same outline. The card is clipped,
//     so the stroke shows only its inner half: a 6px stroke reads as a 3px inside
//     border. (The export's mask trick produced 1px; the thickening is deliberate.)
//
// NOTE the gradient runs WHITE to grey, left to right — so the left-hand end of
// the edge is white on a white page and stays invisible however thick it is.
// Thickening only shows on the right. That is the export's own gradient.
export const CARD_CLIP_PATH =
  'M0.95471 0C0.97972 0 1 0.03042 1 0.06794V0.93207C1 0.96958 0.97972 1 0.95471 1H0.41196C0.38694 1 0.36667 0.96959 0.36667 0.93207V0.86794C0.36667 0.83042 0.34639 0.8 0.32138 0.8H0.04529C0.02028 0.8 0 0.76958 0 0.73206V0.06794C0 0.03042 0.02028 0 0.04529 0H0.95471Z';

// The notch as fractions of the card, so the plate and the bite cannot drift.
export const NOTCH_WIDTH = '36.667%';
export const NOTCH_HEIGHT = '20%';

const OUTLINE =
  'M501.223 0C514.354 0 525 10.6456 525 23.7773V326.223C525 339.354 514.354 350 501.223 350H216.277C203.145 350 192.5 339.355 192.5 326.223V303.777C192.5 290.646 181.855 280 168.723 280H23.7772C10.6454 280 0 269.354 0 256.223V23.7773C0 10.6456 10.6456 0 23.7773 0H501.223Z';

export default function CardShape({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 525 350"
      // Stretches to the card's box, matching the clip path above.
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={OUTLINE}
        stroke="url(#ltcTestimonialCardEdge)"
        // The card's clip path eats the outer half of the stroke, so the rendered
        // edge is HALF this: 6 reads as 3px. The export's mask trick produced 1px;
        // the thickening is deliberate. Verified at 1:1.
        strokeWidth="6"
        // Without this the non-uniform stretch would make the edge thicker on one
        // axis than the other.
        vectorEffect="non-scaling-stroke"
      />
      <defs>
        {/* Left to right, white into a half-transparent grey — the export's own
            gradient, which gives the edge its lit-from-the-left look. */}
        <linearGradient
          id="ltcTestimonialCardEdge"
          x1="0"
          y1="175"
          x2="525"
          y2="175"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#BDBDBD" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
