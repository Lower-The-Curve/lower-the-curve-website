import { notFound } from 'next/navigation';
import {
  getPartnerDetailPage,
  getPartnerApproachIntro,
  getWhatWeBuilt,
  getPartnerTestimonial,
  getCaseStudyMetrics,
} from '@/lib/shopify';
import PartnerDetailSection from '@/components/sections/PartnerDetailSection/PartnerDetailSection';
import PartnerApproachSection from '@/components/sections/PartnerApproachSection/PartnerApproachSection';
import PartnerDetailProblemSection, {
  partnerNameOf,
} from '@/components/sections/PartnerDetailProblemSection/PartnerDetailProblemSection';
import WhatWeBuiltSection from '@/components/sections/WhatWeBuiltSection/WhatWeBuiltSection';
import PartnerTestimonialSection from '@/components/sections/PartnerTestimonialSection/PartnerTestimonialSection';
import PartnerDetailResultsSection, {
  partnerNameOf as resultsPartnerNameOf,
} from '@/components/sections/PartnerDetailResultsSection/PartnerDetailResultsSection';
import CaseStudyMetricsSection from '@/components/sections/CaseStudyMetricsSection/CaseStudyMetricsSection';
import DeliveredSection from '@/components/sections/DeliveredSection/DeliveredSection';
import JsonLd from '@/components/seo/JsonLd';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  cmsPageSeo,
  pageMetadata,
  webpageJsonLd,
} from '@/lib/seo';
import './page.css';

function fieldValue(node, ...keys) {
  for (const key of keys) {
    const value = node?.fields?.find((f) => f.key === key)?.value;

    if (value) return value;
  }

  return null;
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = node?.fields?.find((f) => f.key === key)?.reference?.image;

    if (image) return image;
  }

  return null;
}

function partnerSeo(section, handle) {
  const partner = section.fields?.find((f) => f.key === 'name')?.reference;
  const name = fieldValue(partner, 'name', 'title') ?? partner?.handle ?? handle;
  const subheading = fieldValue(section, 'subheading', 'subtitle');
  const body = fieldValue(section, 'body', 'description');
  const mockup = imageFrom(section, 'mockup', 'image');
  const seo = cmsPageSeo(section);
  const path = `/partners/${handle}`;

  return {
    name,
    path,
    title: seo.title || `${name} Case Study`,
    description:
      seo.description || [subheading, body].filter(Boolean).join(' '),
    image: seo.image || mockup?.url,
    imageWidth: seo.image ? seo.imageWidth : mockup?.width,
    imageHeight: seo.image ? seo.imageHeight : mockup?.height,
    imageAlt: seo.image
      ? seo.imageAlt
      : mockup?.altText || `${name} case study`,
  };
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const section = await getPartnerDetailPage(handle);

  if (!section) {
    return {
      title: 'Case Study Not Found',
      robots: { index: false, follow: false },
    };
  }

  const seo = partnerSeo(section, handle);

  return pageMetadata({
    path: seo.path,
    title: seo.title,
    description: seo.description,
    image: seo.image,
    imageWidth: seo.imageWidth,
    imageHeight: seo.imageHeight,
    imageAlt: seo.imageAlt,
    type: 'article',
    modifiedTime: section.updatedAt,
  });
}

// No handles are listed up front: each partner page is rendered on its first
// visit and then cached like the other pages (refreshed in the background
// every 60 s, see lib/shopify). Without this, a [handle] route renders on
// every request.
export async function generateStaticParams() {
  return [];
}

export default async function PartnerDetailPage({ params }) {
  const { handle } = await params;

  const section = await getPartnerDetailPage(handle);

  if (!section) notFound();

  const seo = partnerSeo(section, handle);

  // `case_study_approach` is a list field; a partner has one approach entry.
  const approach = section.fields?.find((f) => f.key === 'case_study_approach')
    ?.references?.nodes?.[0];
  const approachIntro = await getPartnerApproachIntro();
  const whatWeBuilt = await getWhatWeBuilt(section);
  const partnerTestimonial = await getPartnerTestimonial(section);
  const metrics = await getCaseStudyMetrics(section);

  return (
    <>
      <JsonLd
        data={[
          webpageJsonLd({
            path: seo.path,
            title: seo.title,
            description: seo.description,
            image: seo.image,
          }),
          articleJsonLd({
            path: seo.path,
            title: seo.title,
            description: seo.description,
            image: seo.image,
            dateModified: section.updatedAt,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Case Studies', path: '/case-studies' },
            { name: seo.name, path: seo.path },
          ]),
        ]}
      />
      <main className="partner-detail-page">
        <PartnerDetailSection section={section} />
      <PartnerDetailProblemSection
        section={section.problem?.reference}
        partnerName={partnerNameOf(section)}
      />
      <PartnerApproachSection section={approach} intro={approachIntro} />
      <WhatWeBuiltSection section={whatWeBuilt} />
      <PartnerDetailResultsSection
        section={section.results?.reference}
        partnerName={resultsPartnerNameOf(section)}
      />
      <CaseStudyMetricsSection
        section={metrics}
        partner={section}
      />
      <PartnerTestimonialSection section={partnerTestimonial} />
      <DeliveredSection
        section={section.exploreMore?.reference}
        allCards={section.deliveredCards}
        partner={section}
      />
      </main>
    </>
  );
}
