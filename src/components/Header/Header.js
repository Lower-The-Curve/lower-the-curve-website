import Link from 'next/link';
import { getMenu } from '@/lib/shopify';
import styles from './Header.module.css';

// Server Component: fetches the main menu from Shopify and renders the site
// navigation. Rendered once in the root layout so it appears on every page.
export default async function Header() {
  const menu = await getMenu('main-menu');

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Lower the Curve
        </Link>

        <nav className={styles.nav} aria-label="Main menu">
          <ul className={styles.menu}>
            {menu.map((item) => (
              <li key={item.id} className={styles.item}>
                <Link href={item.path} className={styles.link}>
                  {item.title}
                </Link>

                {item.items.length > 0 && (
                  <ul className={styles.submenu}>
                    {item.items.map((sub) => (
                      <li key={sub.id}>
                        <Link href={sub.path} className={styles.link}>
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
