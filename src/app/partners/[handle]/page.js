import { notFound } from 'next/navigation';
import { getPartnerDetailPage, getWhatWeBuilt } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import PartnerApproachSection from '@/components/sections/PartnerApproachSection/PartnerApproachSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  const approach = section.fields?.find((f) => f.key === 'approach')?.reference;
  const whatWeBuilt = await getWhatWeBuilt(section);

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
      <PartnerApproachSection section={approach} />
      <WhatWeBuiltSection section={whatWeBuilt} />
    </main>
  );
}
