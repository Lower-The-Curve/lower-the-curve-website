// Figma “Stats sticky menu” line layer (381:456): rotated pattern fill at 10%
// opacity. Full frame export lives in public/textures/stats-bar-lines-overlay.svg;
// this component scales it to the live stats bar (1248×145 artboard).
// It loads stats-bar-lines-overlay.webp: that SVG rendered at 2× (2496×290,
// lossless WebP, 28 KB). The SVG only wrapped a 364 KB PNG, so it was
// heavier than the picture it draws. Re-export the WebP if the SVG changes.
// loading="lazy": the texture is display:none at ≤1024px (vector stripes
// replace it there), so phones and tablets never download it.
export default function StatsBarLines({ className = 'rich-text-with-stats__stats-lines' }) {
  return (
    <img
      src="/textures/stats-bar-lines-overlay.webp"
      alt=""
      aria-hidden="true"
      className={className}
      width={1248}
      height={145}
      loading="lazy"
      decoding="async"
    />
  );
}
