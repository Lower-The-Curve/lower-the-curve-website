// The artwork behind the get-in-touch band: three heavily blurred shapes — a grey
// glow at each side and a brand-blue one rising from the bottom centre.
//
// WHY IT IS INLINE RATHER THAN THE CMS IMAGE.
// The same artwork exists in Shopify as `get_in_touch_background`, and it was
// loaded through next/image first. That could not work: the file is 1440x450 and
// `object-fit: cover` scales it UP to cover any viewport wider than 1440, which
// pushes its top out of the band. What you see then starts mid-artwork, where the
// grey is already at full strength — a hard horizontal seam against the white page
// above it. `contain` would letterbox instead, and neither is right for a
// full-bleed wash.
//
// Inline, the SVG can carry `preserveAspectRatio="none"` and simply stretch to
// whatever box the band is. Nothing is cropped at any width, so there is no seam.
// A non-uniform stretch is safe here precisely because the artwork is three soft
// gradients with no edge or detail to distort.
//
// The `get_in_touch_background` field is therefore UNUSED. Delete it in the
// admin, or say the word and this can read it again — but then the seam is back
// unless the band is also given the artwork's exact aspect ratio.
//
// TAKEN FROM THE FIGMA EXPORT, with three changes:
//  1. The ids are namespaced (`ltcCta*`, not `filter1_f_…` / `paint0_linear_…`).
//     Figma numbers those per export and `url(#id)` resolves to the FIRST match in
//     the document, so two un-namespaced exports on a page silently share one
//     definition — and with blur filters that is a visible bug, not a cosmetic one.
//  2. The export's `clipPath` is dropped: it clips to 0,0,1440,450, which is the
//     viewBox, and an SVG viewport already clips to that.
//  3. The export's text is dropped. It ships the headline, lede and button
//     FLATTENED INTO PATHS; here they are real elements fed by the metaobject, so
//     they stay selectable, translatable and editable in Shopify.
export default function BookACallBackdrop({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 450"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.94">
        <g filter="url(#ltcCtaGlowRight)">
          <circle cx="1401.5" cy="534.5" r="384.5" fill="url(#ltcCtaGreyRight)" />
        </g>
        <g filter="url(#ltcCtaGlowLeft)">
          <circle cx="8.5" cy="534.5" r="384.5" fill="url(#ltcCtaGreyLeft)" />
        </g>
        <g filter="url(#ltcCtaGlowBottom)">
          <ellipse cx="705" cy="748.5" rx="512" ry="511.5" fill="url(#ltcCtaBlue)" />
        </g>
      </g>
      <defs>
        <filter
          id="ltcCtaGlowRight"
          x="806.9"
          y="-60.1"
          width="1189.2"
          height="1189.2"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="105.05" />
        </filter>
        <filter
          id="ltcCtaGlowLeft"
          x="-586.1"
          y="-60.1"
          width="1189.2"
          height="1189.2"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="105.05" />
        </filter>
        <filter
          id="ltcCtaGlowBottom"
          x="-17.1"
          y="26.9"
          width="1444.2"
          height="1443.2"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="105.05" />
        </filter>
        <linearGradient
          id="ltcCtaGreyRight"
          x1="1017"
          y1="534.5"
          x2="1786"
          y2="534.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BFBFBF" />
          <stop offset="1" stopColor="#BDBDBD" />
        </linearGradient>
        <linearGradient
          id="ltcCtaGreyLeft"
          x1="-376"
          y1="534.5"
          x2="393"
          y2="534.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BFBFBF" />
          <stop offset="1" stopColor="#BDBDBD" />
        </linearGradient>
        {/* The one brand-coloured stop pair — tokens, not the export's raw hexes,
            which were --color-brand-dark and --color-brand character for
            character. The greys above have no token and stay literal. */}
        <linearGradient
          id="ltcCtaBlue"
          x1="1297"
          y1="748.657"
          x2="209.826"
          y2="748.657"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
