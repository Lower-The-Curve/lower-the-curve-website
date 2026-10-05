import { notFound } from 'next/navigation';
import { getPartnerDetailPage, getWhatWeBuilt, getCaseStudyMetrics } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import CaseStudyMetricsSection from '@/components/sections/CaseStudyMetricsSection/CaseStudyMetricsSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  const whatWeBuilt = await getWhatWeBuilt(section);
  const metrics = await getCaseStudyMetrics(section);

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <CaseStudyMetricsSection
        section={metrics}
        partner={section}
      />
    </main>
  );
}
