// The "scroll down" cue under the hero headline: three stacked chevrons.
//
// Decorative only — the metaobject carries the cue's text but no icon or link,
// so the mark is drawn here rather than authored in Shopify.
//
// TWO THINGS THAT DIFFER FROM THE FIGMA EXPORT THIS CAME FROM:
//
// 1. One gradient, not three. The export shipped paint0/paint1/paint2, which
//    differ only in their `y` coordinates — and since each has y1 === y2, every
//    one is a purely horizontal gradient, so `y` has no effect on the result.
//    All three were the same gradient written out three times.
//
// 2. The stops read --color-brand-dark / --color-brand instead of the two raw
//    hexes the export hardcoded. Identical colours, but it keeps this file out
//    of the brand-hex grep in DESIGN-SYSTEM.md, and re-tinting the brand moves
//    the chevrons with everything else. (`var()` does resolve in `stop-color` —
//    verified in-browser, not assumed.)
//
// Note the gradient runs dark-on-the-RIGHT (x1 is the larger x), matching the
// hero headline's blue accent rather than the buttons' dark-on-left order.
export default function ChevronsDownIcon({ className }) {
  return (
    <svg
      className={className}
      width="25"
      height="48"
      viewBox="0 0 25 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.5 35.5L12.5 45.5L2.5 35.5"
        stroke="url(#ltcChevronGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 19L12.5 29L2.5 19"
        stroke="url(#ltcChevronGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 2.5L12.5 12.5L2.5 2.5"
        stroke="url(#ltcChevronGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="ltcChevronGradient"
          x1="24.0625"
          y1="24"
          x2="2.82864"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
