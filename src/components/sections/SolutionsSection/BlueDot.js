// The small blurred blue dot near the top of the stacked (use_stats = false)
// layout. Decorative and aria-hidden — there is no image field on the metaobject,
// so it is drawn here.
//
// TWO THINGS THAT DIFFER FROM THE FIGMA EXPORT THIS CAME FROM:
//
// 1. The stops read --color-brand-dark / --color-brand instead of the two raw
//    hexes the export shipped — which were the values of those tokens
//    character-for-character, so this is the same colour. It just keeps the file
//    out of the brand-hex grep in DESIGN-SYSTEM.md and moves with the brand.
//    Same substitution as SwooshBackdrop and ChevronsDownIcon.
//
// 2. The gradient and filter ids are namespaced (`ltcBlueDot*`, not
//    `paint0_linear_*` / `filter0_f_*`). Figma names the first of each the same
//    way in every export, and `url(#id)` resolves to the FIRST match in the
//    document — so two un-namespaced exports on one page silently share one
//    definition.
//
// The blur is a real `feGaussianBlur` inside the SVG, not a CSS filter, so it
// travels with the element and costs nothing at composite time.
export default function BlueDot({ className }) {
  return (
    <svg
      className={className}
      width="68"
      height="68"
      viewBox="0 0 68 68"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.9" filter="url(#ltcBlueDotBlur)">
        <circle
          cx="33.8389"
          cy="33.8394"
          r="27.7393"
          fill="url(#ltcBlueDotFill)"
        />
      </g>
      <defs>
        <filter
          id="ltcBlueDotBlur"
          x="-0.00039053"
          y="9.77516e-05"
          width="67.6785"
          height="67.6785"
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
            stdDeviation="3.05"
            result="effect1_foregroundBlur"
          />
        </filter>
        <linearGradient
          id="ltcBlueDotFill"
          x1="65.9123"
          y1="33.8479"
          x2="7.01123"
          y2="33.8479"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
