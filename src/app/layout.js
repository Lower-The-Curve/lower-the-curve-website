import { Poppins } from 'next/font/google';
import './typography.css';
import './globals.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import FaviconAnimation from '@/components/FaviconAnimation/FaviconAnimation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Lower the Curve',
  description: 'Headless Shopify storefront',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <FaviconAnimation />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
