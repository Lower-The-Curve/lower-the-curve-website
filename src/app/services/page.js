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

const COMPONENT_SLOTS = ['component1', 'component2'];

// `sections` may be a single reference or a list of references. Normalize.
function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function ServicesPage() {
  const page = await getServicesPage();

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
