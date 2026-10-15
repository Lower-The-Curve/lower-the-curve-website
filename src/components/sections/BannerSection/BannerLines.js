// Figma banner lines drawn in code, instead of the Shopify background image
// (which gets distorted when scaled to the banner's shape).
// Blackroll: mobile lines on tablet/phone. Our Story (story layout): its own
// desktop lines, plus the same mobile lines on tablet/phone.
export default function BannerLines({ story = false }) {
  return (
    <>
      {story && (
        <img
          src="/textures/our-story-lines-desktop.webp"
          alt=""
          aria-hidden="true"
          className="banner__lines-desktop"
          width={915}
          height={516}
          decoding="async"
        />
      )}
      <img
        src="/textures/banner-lines-mobile.webp"
        alt=""
        aria-hidden="true"
        className="banner__lines-mobile"
        width={388}
        height={412}
        decoding="async"
      />
    </>
  );
}
