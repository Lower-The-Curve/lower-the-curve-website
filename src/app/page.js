import { getHomePage } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import PartnersSection, {
  PARTNERS_TYPE,
} from '@/components/sections/PartnersSection/PartnersSection';
import SolutionsSection, {
  SOLUTIONS_TYPE,
} from '@/components/sections/SolutionsSection/SolutionsSection';
import styles from './page.module.css';

// The home `content` entry's component slots, in the order the admin shows them
// (Component 1 … Component 5). The query aliases the live field keys onto these
// names — see queries/home.js for why the keys don't match their labels.
const COMPONENT_SLOTS = [
  'component1',
  'component2',
  'component3',
  'component4',
  'component5',
];

// A slot may hold a single section reference or a list of them. Empty slots
// contribute nothing.
function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function HomePage() {
  const home = await getHomePage();

  // Render order comes from the CMS: slot order first, then the order within a
  // slot that holds a list.
  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(home?.[slot]));

  return (
    <main className={styles.main}>
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          case PARTNERS_TYPE:
            return <PartnersSection key={section.id} section={section} />;
          case SOLUTIONS_TYPE:
            return <SolutionsSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
