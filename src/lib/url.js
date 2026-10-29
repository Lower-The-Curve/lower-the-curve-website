import { SITE_URL } from './seo';

const PRODUCTION_HOSTS = ['lowerthecurve.com', 'www.lowerthecurve.com'];

function hostOf(value) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeHost(host) {
  if (!host) return null;

  const value = String(host).trim().replace(/^https?:\/\//i, '').split('/')[0];

  return value ? value.toLowerCase() : null;
}

export function toRelativePath(url, extraHosts = []) {
  if (!url) return '/';

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;

  const internalHosts = new Set(
    [
      ...PRODUCTION_HOSTS,
      hostOf(SITE_URL),
      ...extraHosts.map(normalizeHost),
    ].filter(Boolean)
  );

  if (!internalHosts.has(parsed.host.toLowerCase())) return url;

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
