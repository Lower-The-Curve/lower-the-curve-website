import { notFound } from 'next/navigation';
import { getPartnerDetailPage, getWhatWeBuilt } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import PartnerDetailResultsSection, {
  partnerNameOf,
} from '@/components/sections/PartnerDetailResultsSection/PartnerDetailResultsSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  const whatWeBuilt = await getWhatWeBuilt(section);

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <PartnerDetailResultsSection
        section={section.results?.reference}
        partnerName={partnerNameOf(section)}
      />
    </main>
  );
}
