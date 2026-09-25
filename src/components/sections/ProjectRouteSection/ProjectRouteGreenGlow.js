// Small green disc on the mobile project-route frame. Decorative and
// aria-hidden — drawn here because there is no image field for it.
//
// Same two Figma-export fixes as ProjectRouteGlow / GreenGlow: namespaced ids
// so `url(#id)` cannot collide, and the stops stay the export's greens (not
// --color-accent-green — those tokens are contrast-tuned for text).
export default function ProjectRouteGreenGlow({ className }) {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.9" filter="url(#ltcProjectRouteGreenGlowBlur)">
        <circle
          cx="14.9688"
          cy="14.9692"
          r="11.8691"
          fill="url(#ltcProjectRouteGreenGlowFill)"
        />
      </g>
      <defs>
        <filter
          id="ltcProjectRouteGreenGlowBlur"
          x="-0.00039053"
          y="9.77516e-05"
          width="29.9383"
          height="29.9383"
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
            stdDeviation="1.55"
            result="effect1_foregroundBlur"
          />
        </filter>
        <linearGradient
          id="ltcProjectRouteGreenGlowFill"
          x1="22.3907"
          y1="2.48332"
          x2="7.74578"
          y2="4.03954"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#80EA71" />
          <stop offset="1" stopColor="#298C6D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
