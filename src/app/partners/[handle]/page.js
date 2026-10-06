import { notFound } from 'next/navigation';
import {
  getPartnerDetailPage,
  getPartnerApproachIntro,
  getWhatWeBuilt,
  getCaseStudyMetrics,
} from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import PartnerApproachSection from '@/components/sections/PartnerApproachSection/PartnerApproachSection';
import PartnerDetailProblemSection, {
  partnerNameOf,
} from '@/components/sections/PartnerDetailProblemSection/PartnerDetailProblemSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import PartnerDetailResultsSection, {
  partnerNameOf,
} from '@/components/sections/PartnerDetailResultsSection/PartnerDetailResultsSection';
import CaseStudyMetricsSection from '@/components/sections/CaseStudyMetricsSection/CaseStudyMetricsSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  // `case_study_approach` is a list field; a partner has one approach entry.
  const approach = section.fields?.find((f) => f.key === 'case_study_approach')
    ?.references?.nodes?.[0];
  const approachIntro = await getPartnerApproachIntro();
  const whatWeBuilt = await getWhatWeBuilt(section);
  const metrics = await getCaseStudyMetrics(section);

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
      <PartnerApproachSection section={approach} intro={approachIntro} />
      <PartnerDetailProblemSection
        section={section.problem?.reference}
        partnerName={partnerNameOf(section)}
      />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <PartnerDetailResultsSection
        section={section.results?.reference}
        partnerName={partnerNameOf(section)}
      <CaseStudyMetricsSection
        section={metrics}
        partner={section}
      />
    </main>
  );
}
