import { getShopifyAppsPage, getAppPopUps } from "@/lib/shopify";
import HeroSection, {
  HERO_SECTION_TYPE,
} from "@/components/sections/HeroSection/HeroSection";
import AppCardsSection, {
  APP_CARDS_SECTION_TYPE,
} from "@/components/sections/AppCardsSection/AppCardsSection";
import "./page.css";

export const metadata = {
  title: "Shopify Apps",
};

const COMPONENT_SLOTS = ["sections", "component2"];

function sectionsIn(slot) {
  if (!slot) return [];

  const nodes = slot.references?.nodes;
  if (nodes?.length) return nodes;

  return slot.reference ? [slot.reference] : [];
}

export default async function ShopifyAppsPage() {
  const [page, popups] = await Promise.all([
    getShopifyAppsPage(),
    getAppPopUps(),
  ]);

  const sections = COMPONENT_SLOTS.flatMap((slot) => sectionsIn(page?.[slot]));

  return (
    <main className="shopify-apps-page">
      {sections.map((section) => {
        switch (section.type) {
          case HERO_SECTION_TYPE:
            return <HeroSection key={section.id} section={section} />;
          case APP_CARDS_SECTION_TYPE:
            return (
              <AppCardsSection
                key={section.id}
                section={section}
                popups={popups}
              />
            );
          default:
            return null;
        }
      })}
    </main>
  );
}
