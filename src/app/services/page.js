import { getServicesPage } from '@/lib/shopify';
import HeroSection, {
  HERO_SECTION_TYPE,
} from '@/components/sections/HeroSection/HeroSection';
import './page.css';

export const metadata = {
  title: 'Services',
};

export default async function ServicesPage() {
  const page = await getServicesPage();

  // `sections` may be a single reference or a list of references. Normalize.
  const sections =
    page?.sections?.references?.nodes ??
    (page?.sections?.reference ? [page.sections.reference] : []);

  return (
    <main className="services-page">
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
