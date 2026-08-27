// The blue swoosh behind the top of the solutions section: a long thin arc that
// enters at the top right and sweeps down across to the left edge.
//
// Decorative only — the `solutions` metaobject has no image field, so the shape
// is drawn here rather than authored in Shopify. It is aria-hidden for that
// reason; there is nothing in it for a screen reader.
//
// TWO THINGS THAT DIFFER FROM THE FIGMA EXPORT THIS CAME FROM:
//
// 1. The stops read --color-brand-dark / --color-brand instead of the two raw
//    hexes the export hardcoded — which were character-for-character the values
//    of those two tokens. Identical colours, but it keeps this file out of the
//    brand-hex
//    grep in DESIGN-SYSTEM.md, and re-tinting the brand moves the swoosh with
//    everything else. Same substitution as ChevronsDownIcon.
//
// 2. The gradient id is namespaced (`ltcSolutionsSwoosh`, not `paint0_linear_…`),
//    matching ltcArrowGradient / ltcChevronGradient, so two Figma exports pasted
//    into the same page can't collide on `paint0_linear_*`.
//
// The path deliberately runs outside the viewBox on both sides (x from -247 to
// 1474.5 against a 0–1440 box), so the arc is clipped by the SVG viewport and
// reads as passing through the section rather than starting and stopping in it.
//
// The width/height attributes are the artwork's intrinsic size; the CSS scales
// it to 100% of the section and lets height follow from the aspect ratio.
export default function SwooshBackdrop({ className }) {
  return (
    <svg
      className={className}
      width="1440"
      height="604"
      viewBox="0 0 1440 604"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1474.5 0C1447.83 0 1421.17 0 1394.5 0C1394.68 32.6004 1392.79 59.7413 1387.4 90.9716C1344.23 376.467 998.527 460.736 722.37 484.963C431.776 516.729 140.274 473.954 -161.531 522.101C-180.034 527.364 -196.181 532.875 -213.776 544.67C-230.625 555.466 -247.942 578.358 -247 604C-232 604 -217 604 -202 604C-203.716 588.434 -179.122 574.455 -149.493 567.274C129.074 527.634 432.403 573.674 727.617 547.242C1004.47 526.147 1397.22 454.581 1464.34 105.27C1471.31 68.5383 1474.08 37.1254 1474.5 0Z"
        fill="url(#ltcSolutionsSwoosh)"
      />
      <defs>
        <linearGradient
          id="ltcSolutionsSwoosh"
          x1="1448.5"
          y1="24.4978"
          x2="472.999"
          y2="558.997"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
