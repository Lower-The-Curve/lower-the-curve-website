/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
