import { getCaseStudiesPage } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import BannerSection, {
  BANNER_TYPE,
} from '@/components/sections/BannerSection/BannerSection';
import DeliveredSection, {
  DELIVERED_TYPE,
} from '@/components/sections/DeliveredSection/DeliveredSection';
import RichTextWithStatsSection, {
  RICH_TEXT_WITH_STATS_TYPE,
} from '@/components/sections/RichTextWithStatsSection/RichTextWithStatsSection';
import JsonLd from '@/components/seo/JsonLd';
import {
  breadcrumbJsonLd,
  cmsPageSeo,
  pageMetadata,
  webpageJsonLd,
} from '@/lib/seo';
import './page.css';

export async function generateMetadata() {
  const page = await getCaseStudiesPage();

  return pageMetadata({ path: '/case-studies', ...cmsPageSeo(page) });
}

// The Case Studies `content` entry's component slots, in the order the admin
// shows them (Component 1 … Component 6). The query aliases the live field keys
// onto these names — see queries/pages/caseStudies.js for why the keys don't
// match their labels.
const COMPONENT_SLOTS = [
  'component1',
  'component2',
  'component3',
  'component4',
  'component5',
  'component6',
];

// A slot may hold a single section reference or a list of them. Empty slots
// contribute nothing.
function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function CaseStudiesPage() {
  const page = await getCaseStudiesPage();
  const seo = cmsPageSeo(page);

  // Render order comes from the CMS: slot order first, then the order within a
  // slot that holds a list.
  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <>
      <JsonLd
        data={[
          webpageJsonLd({
            path: '/case-studies',
            title: seo.title,
            description: seo.description,
            image: seo.image,
            type: 'CollectionPage',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Case Studies', path: '/case-studies' },
          ]),
        ]}
      />
      <main className="case-studies-page">
        {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return (
              <HeroSection key={section.id} section={section} fadeBottom />
            );
          case BANNER_TYPE:
            return <BannerSection key={section.id} section={section} />;
          case DELIVERED_TYPE:
            return <DeliveredSection key={section.id} section={section} />;
          case RICH_TEXT_WITH_STATS_TYPE:
            return (
              <RichTextWithStatsSection key={section.id} section={section} />
            );
          default:
            return null;
        }
        })}
      </main>
    </>
  );
}
