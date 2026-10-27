/** @type {import('next').NextConfig} */
const REDIRECTS = [
  ['/case-stuides', '/case-studies'],
  [
    '/case-studie/misi-empowering-ai-powered-fashion-recommendations-through-shopify',
    '/partners/misi',
  ],
  [
    '/case-studie/how-we-scalated-12-positions-on-enterprise-app-store',
    '/partners/partner-kwik',
  ],
  [
    '/case-studie/taking-blackrolls-e-commerce-to-the-next-level-across-8-stores',
    '/partners/blackroll',
  ],
  [
    '/case-studie/doc-weingart-advanced-shopify-setup-for-health-focused-products',
    '/case-studies',
  ],
  [
    '/case-studie/thinker-toys-bringing-30-years-of-in-store-experience-online',
    '/case-studies',
  ],
  ['/service/public-shopify-apps', '/services'],
  ['/service/seamless-shopify-integrations', '/services'],
  ['/service/theme-development', '/services'],
  ['/service/b2b-functionalities', '/services'],
  ['/about', '/about-us'],
  ['/team', '/about-us'],
];

const nextConfig = {
  async redirects() {
    return REDIRECTS.flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      { source: `${source}/`, destination, permanent: true },
    ]);
  },
  experimental: {
    // Inline each route's CSS into a <style> tag in the HTML instead of
    // linking several small stylesheets, which Lighthouse flags as
    // render-blocking. 
    inlineCss: true,
  },
  images: {
    // AVIF first, WebP fallback: next/image picks the first one the browser
    // accepts. 
    formats: ['image/avif', 'image/webp'],
    // Shopify serves product/metaobject media from its CDN. Allow it for next/image.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
