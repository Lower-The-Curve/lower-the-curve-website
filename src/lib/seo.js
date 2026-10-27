export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://lower-the-curve-website.vercel.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'Lower the Curve';

export const SITE_DESCRIPTION =
  'Lower the Curve is a Shopify development agency building high-impact storefronts, public apps, integrations and B2B solutions for growing brands.';

export const DEFAULT_SOCIAL_IMAGE = '/assets/og-default.jpg';

export const PAGE_SEO = {
  '/': {
    title: 'Shopify Development Agency',
    description: SITE_DESCRIPTION,
  },
  '/services': {
    title: 'Shopify Services',
    description:
      'Shopify app development, integrations, theme development and B2B functionality — built to help brands scale.',
  },
  '/case-studies': {
    title: 'Shopify Case Studies',
    description:
      'Explore Lower the Curve case studies and see how custom Shopify builds, integrations and optimisation help brands grow.',
  },
  '/about-us': {
    title: 'About Us',
    description:
      'Meet the team behind Lower the Curve and learn how we help Shopify brands grow with clarity and confidence.',
  },
  '/shopify-apps': {
    title: 'Shopify App Development',
    description:
      'Lower the Curve builds public Shopify apps that help merchants reach new customers and grow through the Shopify App Store.',
  },
};

export function absoluteUrl(path = '/') {
  const value = String(path || '/');

  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) {
    return value;
  }

  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function routeKey(path = '/') {
  const value = String(path || '/');
  return value === '/' ? '/' : value.replace(/\/+$/, '');
}

export function plainText(value = '') {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function cmsPageSeo(node) {
  const image = node?.seoImage?.reference?.image ?? null;

  return {
    title: node?.seoTitle?.value || undefined,
    description: node?.seoDescription?.value || undefined,
    image: image?.url || undefined,
    imageWidth: image?.width || undefined,
    imageHeight: image?.height || undefined,
    imageAlt: image?.altText || undefined,
  };
}

export function trimDescription(value, maxLength = 160) {
  const text = plainText(value);

  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, Math.max(0, maxLength - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;

  return `${cut.replace(/[.,;:!?-]+$/, '')}…`;
}

export function pageMetadata({
  path = '/',
  title,
  description,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
} = {}) {
  const route = routeKey(path);
  const fallback = PAGE_SEO[route] ?? {};
  const pageTitle = plainText(title || fallback.title || SITE_NAME);
  const socialTitle = pageTitle.includes(SITE_NAME)
    ? pageTitle
    : `${pageTitle} | ${SITE_NAME}`;
  const pageDescription = trimDescription(
    description || fallback.description || SITE_DESCRIPTION
  );
  const canonical = absoluteUrl(route);
  const socialImage = absoluteUrl(image || DEFAULT_SOCIAL_IMAGE);
  const width = imageWidth ?? (image ? undefined : 1200);
  const height = imageHeight ?? (image ? undefined : 630);

  return {
    title: route === '/' ? socialTitle : pageTitle,
    description: pageDescription,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description: pageDescription,
      images: [
        {
          url: socialImage,
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
          alt: imageAlt || SITE_NAME,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: pageDescription,
      images: [socialImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl('/favicon.svg'),
    image: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function webpageJsonLd({
  path = '/',
  title,
  description,
  image,
  type = 'WebPage',
  datePublished,
  dateModified,
} = {}) {
  const route = routeKey(path);
  const fallback = PAGE_SEO[route] ?? {};
  const pageTitle = plainText(title || fallback.title || SITE_NAME);
  const pageDescription = trimDescription(
    description || fallback.description || SITE_DESCRIPTION
  );
  const url = absoluteUrl(route);

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: pageTitle,
    description: pageDescription,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: absoluteUrl(image || DEFAULT_SOCIAL_IMAGE),
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function articleJsonLd({
  path = '/',
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
} = {}) {
  const route = routeKey(path);
  const url = absoluteUrl(route);
  const pageTitle = title || PAGE_SEO[route]?.title || SITE_NAME;
  const pageDescription = trimDescription(
    description || PAGE_SEO[route]?.description || SITE_DESCRIPTION
  );
  const byline =
    typeof author === 'string'
      ? { '@type': 'Person', name: author }
      : author || { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: plainText(pageTitle),
    description: pageDescription,
    image: [absoluteUrl(image || DEFAULT_SOCIAL_IMAGE)],
    inLanguage: 'en',
    mainEntityOfPage: { '@id': `${url}#webpage` },
    author: byline,
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function breadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const target = item.path || item.url || item.href;
      const entry = {
        '@type': 'ListItem',
        position: index + 1,
        name: plainText(item.name || item.title || ''),
      };

      if (target) entry.item = absoluteUrl(target);

      return entry;
    }),
  };
}
