import {
  getAboutUsPage,
  getCaseStudiesPage,
  getHomePage,
  getPartnerDetailHandles,
  getServicesPage,
  getShopifyAppsPage,
} from '@/lib/shopify';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_ROUTES = [
  {
    path: '/',
    getPage: getHomePage,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/services',
    getPage: getServicesPage,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/case-studies',
    getPage: getCaseStudiesPage,
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/about-us',
    getPage: getAboutUsPage,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/shopify-apps',
    getPage: getShopifyAppsPage,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
];

async function staticEntry(route) {
  let lastModified;

  try {
    const page = await route.getPage();
    lastModified = page?.updatedAt;
  } catch {
    lastModified = undefined;
  }

  return {
    url: absoluteUrl(route.path),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

export default async function sitemap() {
  const [staticEntries, partners] = await Promise.all([
    Promise.all(STATIC_ROUTES.map(staticEntry)),
    getPartnerDetailHandles().catch(() => []),
  ]);

  const partnerEntries = partners.map(({ handle, updatedAt }) => ({
    url: absoluteUrl(`/partners/${handle}`),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...partnerEntries];
}
