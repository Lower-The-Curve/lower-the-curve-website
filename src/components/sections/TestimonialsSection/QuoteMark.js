// The blue quote mark that opens each card at the top left and closes it at the
// bottom right. Drawn rather than typed: the design's mark is two hard-edged
// slabs, which no font's “ glyph matches closely enough to pass for it.
//
// Decorative — the quotation is already marked up as a <blockquote>, so this is
// aria-hidden and adds nothing for a screen reader.
export default function QuoteMark({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 34 26"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 26 L8 0 H15 L11 26 Z" fill="currentColor" />
      <path d="M19 26 L27 0 H34 L30 26 Z" fill="currentColor" />
    </svg>
  );
}
