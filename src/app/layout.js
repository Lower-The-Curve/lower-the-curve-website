import { Poppins } from 'next/font/google';
import './typography.css';
import './globals.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import FaviconAnimation from '@/components/FaviconAnimation/FaviconAnimation';
import JsonLd from '@/components/seo/JsonLd';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl('/'),
    images: [
      {
        url: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_SOCIAL_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <FaviconAnimation />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
