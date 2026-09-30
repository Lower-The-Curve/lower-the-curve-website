import { notFound } from 'next/navigation';
import { getPartnerDetailPage } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
    </main>
  );
}
