import { absoluteUrl } from '@/lib/seo';

function isProduction() {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production';
  }

  return process.env.NODE_ENV === 'production';
}

export default function robots() {
  const sitemap = absoluteUrl('/sitemap.xml');

  if (!isProduction()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/partner-detail-test'],
      },
    ],
    sitemap,
  };
}
