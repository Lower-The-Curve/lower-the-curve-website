// Soft grey disc on the right of the project-route section. Decorative and
// aria-hidden — Figma's layer-blur ellipse, drawn here because there is no
// image field for it.
//
// TWO THINGS THAT DIFFER FROM THE FIGMA EXPORT THIS CAME FROM:
//
// 1. The gradient and filter ids are namespaced (`ltcProjectRouteGlow*`, not
//    `paint0_linear_*` / `filter0_f_*`). Figma names the first of each the same
//    way in every export, and `url(#id)` resolves to the FIRST match in the
//    document.
//
// 2. The stops stay the export's greys. They are not brand tokens.
//
// The circle is centred at x=78.5 inside a 130-wide box, so most of it sits
// toward the right. Positioned flush right so it bleeds off the page edge.
export default function ProjectRouteGlow({ className }) {
  return (
    <svg
      className={className}
      width="130"
      height="157"
      viewBox="0 0 130 157"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.71" filter="url(#ltcProjectRouteGlowBlur)">
        <circle
          cx="78.4911"
          cy="78.4918"
          r="52.3898"
          transform="rotate(38.4747 78.4911 78.4918)"
          fill="url(#ltcProjectRouteGlowFill)"
        />
      </g>
      <defs>
        <filter
          id="ltcProjectRouteGlowBlur"
          x="-0.000391006"
          y="-2.47955e-05"
          width="156.983"
          height="156.984"
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
            stdDeviation="13.05"
            result="effect1_foregroundBlur"
          />
        </filter>
        <linearGradient
          id="ltcProjectRouteGlowFill"
          x1="43.2037"
          y1="33.8956"
          x2="130.094"
          y2="51.2797"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F3F2F2" />
          <stop offset="1" stopColor="#989898" />
        </linearGradient>
      </defs>
    </svg>
  );
}
