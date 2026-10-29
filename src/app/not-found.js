import Link from 'next/link';
import './not-found.css';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__inner">
        <p className="not-found__eyebrow">404</p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__copy">
          The page you requested does not exist or has moved.
        </p>
        <Link href="/" className="not-found__link">
          Return to the homepage
        </Link>
      </div>
    </main>
  );
}
