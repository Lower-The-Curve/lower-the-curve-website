// The partner testimonial card's surface: the notched rectangle exported from
// Figma as public/assets/background rectangle.svg (a 358x180 frame).
//
// TWO THINGS THAT DIFFER FROM THE EXPORT, same two as SwooshBackdrop:
//
// 1. preserveAspectRatio is "none" so the shape stretches to whatever box the
//    card ends up being. The export's default (xMidYMid meet) would letterbox
//    a non-uniformly-sized card instead of stretching the outline. The trade is
//    the same one CARD_CLIP_PATH made: corner arcs go slightly elliptical when
//    the card is not 358:180.
//
// 2. The id is namespaced (`ltcPartnerTestimonialEdge`) so it can't collide
//    with another Figma export's `paint0_linear_*`, and the edge is a plain
//    stroke on the outline path rather than the export's 1.989px offset ring
//    plus mask — same 2px visual, a fraction of the markup. The gradient stops
//    were character-for-character white -> #BDBDBD 50%, kept as-is because
//    neither has a token.
//
// The fill is the export's own white at 90% opacity (the home card's frosted
// white), and the outline is the notch the logo plate and author band seat in:
// 106/358 of the width, 41/180 of the height — see the 22.78% author-band
// height in PartnerTestimonialSection.css.
const OUTLINE =
  'M348.542 0C353.766 1.6815e-05 358 4.2345 358 9.45801V170.542C358 175.766 353.766 180 348.542 180H115.458C110.235 180 106 175.765 106 170.542V148.458C106 143.234 101.765 139 96.542 139H9.45803C4.23451 139 0 134.765 0 129.542V9.45801C1.61069e-05 4.2345 4.2345 1.28509e-05 9.45801 0H348.542Z';

export default function PartnerTestimonialShape({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 358 180"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={OUTLINE} fill="white" fillOpacity="0.9" />
      <path
        d={OUTLINE}
        stroke="url(#ltcPartnerTestimonialEdge)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <defs>
        <linearGradient
          id="ltcPartnerTestimonialEdge"
          x1="0"
          y1="90"
          x2="358"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#BDBDBD" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
