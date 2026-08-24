// The "scroll down" cue under the hero headline: a double chevron pointing down.
//
// Decorative only — the metaobject carries the cue's text but no icon or link,
// so the mark is drawn here rather than authored in Shopify. Stroke uses
// currentColor, so it takes the brand blue from .scroll in HeroSection.module.css
// instead of hardcoding a hex.
export default function ChevronsDownIcon({ className }) {
  return (
    <svg
      className={className}
      width="28"
      height="30"
      viewBox="0 0 28 30"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4L14 13L25 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 17L14 26L25 17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
