import { getServicesPage } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import BannerSection, {
  BANNER_TYPE,
} from '@/components/sections/BannerSection/BannerSection';
import './page.css';

export const metadata = {
  title: 'Services',
};

// The services `content` entry's component slots, in the order the admin shows
// them. The query aliases the live field keys onto these names — see
// queries/services.js for why the keys don't match their labels.
const COMPONENT_SLOTS = ['component1', 'component2'];

// A slot may hold a single section reference or a list of them. Empty slots
// contribute nothing.
function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function ServicesPage() {
  const page = await getServicesPage();

  // Render order comes from the CMS: slot order first, then the order within a
  // slot that holds a list.
  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <main className="services-page">
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          case BANNER_TYPE:
            return <BannerSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
