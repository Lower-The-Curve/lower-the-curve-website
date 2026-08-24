// The envelope beside the footer's email address.
//
// Not authored in Shopify — the contact column is an ordinary menu, so there is
// no icon field. Footer.js decides when to show this: an item whose link is a
// `mailto:` (or whose label reads as an email address) gets one.
//
// Strokes with currentColor, so it takes its colour from the link rather than
// hardcoding white.
export default function MailIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 2.5L9 8L16.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
