import { notFound } from 'next/navigation';
import {
  getPartnerDetailPage,
  getWhatWeBuilt,
  getPartnerTestimonial,
} from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import PartnerTestimonialSection from '@/components/sections/PartnerTestimonialSection/PartnerTestimonialSection';
import './page.css';

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  const whatWeBuilt = await getWhatWeBuilt(section);
  const partnerTestimonial = await getPartnerTestimonial(section);

  return (
    <main className="partner-detail-page">
      <PartnerDetailSection section={section} />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <PartnerTestimonialSection section={partnerTestimonial} />
    </main>
  );
}
