// The soft green glow low on the left of the stacked (use_stats = false) layout.
// Decorative and aria-hidden, drawn here for the same reason as BlueDot.
//
// The circle is centred at x=25.5 with r=74.5 inside a 113-wide box, so most of it
// sits outside the viewBox to the left and only its right-hand edge shows. That is
// the artwork, not a mistake — the shape is meant to bleed off the page edge, so
// it is positioned flush left.
//
// Ids are namespaced for the same reason as BlueDot's. The stops keep their
// literal hexes: they are NOT the green tokens — --color-accent-green and
// --color-accent-green-dark are contrast-tuned because they colour *text*, and
// pointing this at them would silently retune the hero headline's green word.
// One consumer, so they stay raw; see the promote-on-second-use rule in
// DESIGN-SYSTEM.md.
export default function GreenGlow({ className }) {
  return (
    <svg
      className={className}
      width="113"
      height="175"
      viewBox="0 0 113 175"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.9" filter="url(#ltcGreenGlowBlur)">
        <circle cx="25.5" cy="87.3999" r="74.5" fill="url(#ltcGreenGlowFill)" />
      </g>
      <defs>
        <filter
          id="ltcGreenGlowBlur"
          x="-61.9"
          y="-9.72748e-05"
          width="174.8"
          height="174.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="6.45"
            result="effect1_foregroundBlur"
          />
        </filter>
        <linearGradient
          id="ltcGreenGlowFill"
          x1="72.0861"
          y1="9.02855"
          x2="-19.837"
          y2="18.7966"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#80EA71" />
          <stop offset="1" stopColor="#298C6D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
