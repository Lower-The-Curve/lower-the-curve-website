import { getServicesPage } from "@/lib/shopify";
import HeroSection, {
  HERO_SECTION_TYPE,
} from "@/components/sections/HeroSection/HeroSection";
import ProjectRouteSection, {
  PROJECT_ROUTE_TYPE,
} from "@/components/sections/ProjectRouteSection/ProjectRouteSection";
import "./page.css";

export const metadata = {
  title: "Services",
};

const COMPONENT_SLOTS = ["sections", "component6"];

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
          case PROJECT_ROUTE_TYPE:
            return <ProjectRouteSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
