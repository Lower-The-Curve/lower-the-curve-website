import { notFound } from 'next/navigation';
import { getPartnerDetailPage } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import './page.css';

export const metadata = {
  title: 'Partner Detail Test',
};

export default async function PartnerDetailTestPage({ searchParams }) {
  const { partner = 'blackroll' } = await searchParams;

  const section = await getPartnerDetailPage(partner);

  if (!section) notFound();

  return (
    <main className="partner-detail-test-page">
      <PartnerDetailSection section={section} />
    </main>
  );
}
