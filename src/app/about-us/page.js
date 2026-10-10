import { getAboutUsPage } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import BannerSection, {
  BANNER_TYPE,
} from '@/components/sections/BannerSection/BannerSection';
import FeatureCardsSection, {
  FEATURE_CARDS_TYPE,
} from '@/components/sections/FeatureCardsSection/FeatureCardsSection';
import StatsGridSection, {
  STATS_GRID_TYPE,
} from '@/components/sections/StatsGridSection/StatsGridSection';
import TeamSection, {
  TEAM_SECTION_TYPE,
} from '@/components/sections/TeamSection/TeamSection';
import './page.css';

export const metadata = {
  title: 'About Us',
};

// Component slots in admin order (aliased in queries/pages/aboutUs.js).
const COMPONENT_SLOTS = [
  'component1',
  'component2',
  'component3',
  'component4',
  'component5',
  'component6',
];

function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function AboutUsPage() {
  const page = await getAboutUsPage();

  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <main className="about-us-page">
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          case BANNER_TYPE:
            return <BannerSection key={section.id} section={section} />;
          case FEATURE_CARDS_TYPE:
            return <FeatureCardsSection key={section.id} section={section} />;
          case STATS_GRID_TYPE:
            return <StatsGridSection key={section.id} section={section} />;
          case TEAM_SECTION_TYPE:
            return <TeamSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
