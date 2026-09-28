import { getShopifyAppsPage } from "@/lib/shopify";
import HeroSection, {
  HERO_SECTION_TYPE,
} from "@/components/sections/HeroSection/HeroSection";
import ProjectRouteSection, {
  PROJECT_ROUTE_TYPE,
} from "@/components/sections/ProjectRouteSection/ProjectRouteSection";
import "./page.css";

export const metadata = {
  title: "Shopify Apps",
};

const COMPONENT_SLOTS = ["sections", "component6"];

function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function ShopifyAppsPage() {
  const page = await getShopifyAppsPage();

  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <main className="shopify-apps-page">
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
