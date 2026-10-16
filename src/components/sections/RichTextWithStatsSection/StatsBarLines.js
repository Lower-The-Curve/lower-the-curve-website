// Figma “Stats sticky menu” line layer (381:456): rotated pattern fill at 10%
// opacity. Full frame export lives in public/textures/stats-bar-lines-overlay.svg;
// this component scales it to the live stats bar (1248×145 artboard).
export default function StatsBarLines({ className = 'rich-text-with-stats__stats-lines' }) {
  return (
    <img
      src="/textures/stats-bar-lines-overlay.svg"
      alt=""
      aria-hidden="true"
      className={className}
      width={1248}
      height={145}
      decoding="async"
    />
  );
}
