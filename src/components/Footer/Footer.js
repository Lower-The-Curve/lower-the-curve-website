import Link from 'next/link';
import { getMenu } from '@/lib/shopify';
import styles from './Footer.module.css';

// Server Component: fetches the "footer" menu from Shopify and renders the
// site footer. Rendered once in the root layout so it appears on every page.
export default async function Footer() {
  const menu = await getMenu('footer');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Lower the Curve
        </Link>

        {menu.length > 0 && (
          <nav className={styles.nav} aria-label="Footer menu">
            <ul className={styles.menu}>
              {menu.map((item) => (
                <li key={item.id}>
                  <Link href={item.path} className={styles.link}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className={styles.legal}>
        <p>&copy; {year} Lower the Curve. All rights reserved.</p>
      </div>
    </footer>
  );
}
