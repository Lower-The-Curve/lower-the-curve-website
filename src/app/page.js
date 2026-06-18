import { getHomePage, getPartners } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import PartnersSection from '@/components/sections/PartnersSection/PartnersSection';
import styles from './page.module.css';

export default async function HomePage() {
  const [home, partners] = await Promise.all([getHomePage(), getPartners()]);

  // `sections` may be a single reference or a list of references. Normalize.
  const sections =
    home?.sections?.references?.nodes ??
    (home?.sections?.reference ? [home.sections.reference] : []);

  return (
    <main className={styles.main}>
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}

      <PartnersSection partners={partners} />
    </main>
  );
}
