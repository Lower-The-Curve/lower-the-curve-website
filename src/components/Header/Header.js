import Image from 'next/image';
import Link from 'next/link';
import { getHeader, getMenu } from '@/lib/shopify';
import HeaderNav from './HeaderNav';
import './Header.css';

// Server Component: everything the header renders comes from the `header`
// metaobject in Shopify (Settings > Custom data > Metaobjects > header):
//
//   logo                    -> file_reference, the site logo
//   menu                    -> handle of the Shopify menu to render (Content > Menus)
//   button                  -> link, the CTA's { text, url }
//   button_background_color -> the CTA's fill
//   button_color            -> the CTA's label colour
//
// Rendered once in the root layout so it appears on every page. The interactive
// part (the mobile menu toggle) is isolated in HeaderNav.

function field(node, key) {
  return node?.fields?.find((f) => f.key === key);
}

function fieldValue(node, key) {
  return field(node, key)?.value || null;
}

function imageFrom(node, key) {
  return field(node, key)?.reference?.image ?? null;
}

// A `link` field's value is JSON: {"text":"Book a Call","url":"https://…"}.
function linkFrom(node, key) {
  const raw = fieldValue(node, key);
  if (!raw) return null;
  try {
    const { text, label, url } = JSON.parse(raw);
    const title = text || label;
    return url && title ? { text: title, url } : null;
  } catch {
    return null;
  }
}

// Relative luminance per WCAG, from a #rgb / #rrggbb string. null if unparseable.
function luminance(hex) {
  const short = hex?.replace('#', '') ?? '';
  const full =
    short.length === 3
      ? short
          .split('')
          .map((c) => c + c)
          .join('')
      : short;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;

  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export default async function Header() {
  const header = await getHeader();

  // The menu handle lives in the metaobject, so this fetch depends on the first.
  const items = await getMenu(fieldValue(header, 'menu') ?? 'main-menu');

  const logo = imageFrom(header, 'logo');
  const cta = linkFrom(header, 'button');
  const ctaBackground = fieldValue(header, 'button_background_color');
  const authoredLabel = fieldValue(header, 'button_color');

  // The two colours are authored independently in Shopify, so nothing stops
  // them being set to the same blue — which would make the label invisible.
  // Drop an unreadable label colour and let Button's default white take over.
  const ratio = contrastRatio(authoredLabel, ctaBackground);
  const ctaLabel = ratio !== null && ratio < 3 ? null : authoredLabel;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* The rounded wrapper holds the logo, the nav and the CTA. */}
        <div className="site-header__capsule">
          <Link href="/" className="site-header__brand" aria-label="Lower the Curve — home">
            {logo ? (
              <Image
                src={logo.url}
                alt={logo.altText ?? 'Lower the Curve'}
                width={logo.width ?? 124}
                height={logo.height ?? 50}
                className="site-header__logo"
                priority
                // SVGs go through next/image unoptimized so the optimizer (and
                // its dangerouslyAllowSVG opt-in) never enters the picture.
                unoptimized={/\.svg(\?|$)/i.test(logo.url)}
              />
            ) : (
              <span className="site-header__brand-text">Lower the Curve</span>
            )}
          </Link>

          <HeaderNav
            items={items}
            cta={cta}
            ctaBackground={ctaBackground}
            ctaLabel={ctaLabel}
          />
        </div>
      </div>
    </header>
  );
}
