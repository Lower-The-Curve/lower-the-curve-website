import { getCaseStudiesPage } from '@/lib/shopify';
import BannerSection, {
  BANNER_TYPE,
} from '@/components/sections/BannerSection/BannerSection';
import DeliveredSection, {
  DELIVERED_TYPE,
} from '@/components/sections/DeliveredSection/DeliveredSection';
import './page.css';

export const metadata = {
  title: 'Case Studies',
};

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

  // Render order comes from the CMS: slot order first, then the order within a
  // slot that holds a list.
  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <main className="case-studies-page">
      {sections.map((section) => {
        switch (section.type) {
          case BANNER_TYPE:
            return <BannerSection key={section.id} section={section} />;
          case DELIVERED_TYPE:
            return <DeliveredSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
