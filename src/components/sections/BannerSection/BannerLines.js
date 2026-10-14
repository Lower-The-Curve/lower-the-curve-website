// Figma line layer for the banner below desktop (<= 1024px). Exported from the
// 390px mobile frame of the Blackroll banner; the file lives in
// public/textures/banner-lines-mobile.webp.
//
// Why it exists: the banner's Shopify background image is a landscape desktop
// artwork, and `cover` scales it up to fill a tall tablet/phone banner, which
// distorts its lines. Below desktop that image is switched off and this layer is
// drawn instead (see MOBILE LINES in BannerSection.css). Same pattern as
// RichTextWithStatsSection/StatsBarLines.js.
//
// Spotlight layout only for now: the story layout's mobile lines are a
// different shape and need their own export.
export default function BannerLines({ className = 'banner__lines-mobile' }) {
  return (
    <img
      src="/textures/banner-lines-mobile.webp"
      alt=""
      aria-hidden="true"
      className={className}
      width={390}
      height={412}
      decoding="async"
    />
  );
}
