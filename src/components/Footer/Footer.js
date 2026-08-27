import Image from 'next/image';
import Link from 'next/link';
import { getFooter, getMenu } from '@/lib/shopify';
import GetInTouch from './GetInTouch';
import MailIcon from './MailIcon';
import styles from './Footer.module.css';

// Server Component: everything the footer renders comes from the `footer`
// metaobject in Shopify (Settings > Custom data > Metaobjects > footer):
//
//   logo            -> file_reference, the white logo mark
//   column_1_title  -> heading of the first link column ("Pages")
//   column_2_title  -> ...second ("About Us")
//   column_3_title  -> ...third ("Contact Us")
//   menu_1|2|3      -> handle of the Shopify menu holding each column's links
//   get_in_touch_*  -> the CTA band above the columns; see GetInTouch.js
//
// Rendered once in the root layout so it appears on every page. No client JS —
// it's links and an image.

const COLUMNS = [1, 2, 3];

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

function fieldValue(node, key) {
  return field(node, key)?.value || null;
}

function imageFrom(node, key) {
  return field(node, key)?.reference?.image ?? null;
}

// A label that reads as an email address. The contact column is an ordinary
// menu, so this is what distinguishes it from a page link.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmailItem(item) {
  return /^mailto:/i.test(item.path) || EMAIL.test(item.title.trim());
}

// An email label whose link isn't already a mailto: would otherwise point at
// whatever page the menu item was built from — which for an address is never
// what's meant. Fall back to mailing the label itself.
function hrefFor(item) {
  if (isEmailItem(item) && !/^mailto:/i.test(item.path)) {
    return `mailto:${item.title.trim()}`;
  }
  return item.path;
}

// next/link handles in-app routes; anything with a scheme (mailto:, tel:, an
// absolute URL) has to be a plain anchor. Same split as the Button component.
function FooterLink({ item }) {
  const href = hrefFor(item);
  const icon = isEmailItem(item) ? <MailIcon className={styles.mailIcon} /> : null;

  if (/^(https?:|mailto:|tel:|#)/i.test(href)) {
    return (
      <a href={href} className={styles.link}>
        {icon}
        {item.title}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.link}>
      {icon}
      {item.title}
    </Link>
  );
}

export default async function Footer() {
  const footer = await getFooter();

  // Each column's links live in a separate Shopify menu, named by handle in the
  // metaobject. Fetched together rather than in series — they don't depend on
  // each other. A handle pointing at a menu that doesn't exist resolves to an
  // empty list, so the column still renders its heading.
  const handles = COLUMNS.map((n) => fieldValue(footer, `menu_${n}`));
  const menus = await Promise.all(
    handles.map((handle) => (handle ? getMenu(handle) : []))
  );

  const columns = COLUMNS.map((n, index) => ({
    title: fieldValue(footer, `column_${n}_title`),
    items: menus[index],
  })).filter((column) => column.title || column.items.length);

  const logo = imageFrom(footer, 'logo');

  // The CTA band's fields. `get_in_touch_button` is a `link`, whose value is
  // JSON — unlike the case-studies button, which is a bare `url`.
  const ctaButton = (() => {
    const raw = fieldValue(footer, 'get_in_touch_button');
    if (!raw) return null;
    try {
      const { text, url } = JSON.parse(raw);
      return text && url ? { text, url } : null;
    } catch {
      return null;
    }
  })();

  if (!columns.length && !logo) return null;

  return (
    <footer className={styles.footer}>
      {/* Above the columns, and inside <footer> so every page gets it from the
          root layout. Its artwork is opaque, so it covers the footer's own
          gradient rather than sitting on top of it. */}
      <GetInTouch
        title={fieldValue(footer, 'get_in_touch_title')}
        description={fieldValue(footer, 'get_in_touch_description')}
        button={ctaButton}
      />

      <div className={styles.inner}>
        {logo && (
          <Link href="/" className={styles.brand} aria-label="Lower the Curve — home">
            <Image
              src={logo.url}
              alt={logo.altText ?? 'Lower the Curve'}
              width={logo.width ?? 190}
              height={logo.height ?? 79}
              className={styles.logo}
              // SVGs skip the optimizer, so it never needs dangerouslyAllowSVG.
              unoptimized={/\.svg(\?|$)/i.test(logo.url)}
            />
          </Link>
        )}

        {columns.map((column) => (
          <nav
            key={column.title ?? column.items[0]?.id}
            className={styles.column}
            aria-label={column.title ?? undefined}
          >
            {column.title && <h2 className={styles.heading}>{column.title}</h2>}

            {column.items.length > 0 && (
              <ul className={styles.menu}>
                {column.items.map((item) => (
                  <li key={item.id}>
                    <FooterLink item={item} />
                  </li>
                ))}
              </ul>
            )}
          </nav>
        ))}
      </div>
    </footer>
  );
}
