/** @type {import('next').NextConfig} */
const nextConfig = {
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
