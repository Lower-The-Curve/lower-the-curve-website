import { notFound } from 'next/navigation';
import {
  getPartnerDetailPage,
  getWhatWeBuilt,
  getPartnerTestimonial,
} from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import PartnerTestimonialSection from '@/components/sections/PartnerTestimonialSection/PartnerTestimonialSection';
import { getPartnerDetailPage, getWhatWeBuilt } from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import PartnerDetailProblemSection, {
  partnerNameOf,
} from '@/components/sections/PartnerDetailProblemSection/PartnerDetailProblemSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import './page.css';

export const metadata = {
  title: 'Partner Detail Test',
};

export default async function PartnerDetailTestPage({ searchParams }) {
  const { partner = 'blackroll' } = await searchParams;

  const section = await getPartnerDetailPage(partner);

  if (!section) notFound();

  const whatWeBuilt = await getWhatWeBuilt(section);
  const partnerTestimonial = await getPartnerTestimonial(section);

  return (
    <main className="partner-detail-test-page">
      <PartnerDetailSection section={section} />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <PartnerTestimonialSection section={partnerTestimonial} />
      <PartnerDetailProblemSection
        section={section.problem?.reference}
        partnerName={partnerNameOf(section)}
      />
      <WhatWeBuiltSection section={whatWeBuilt} />
    </main>
  );
}
