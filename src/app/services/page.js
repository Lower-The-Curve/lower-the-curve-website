import { getServicesPage } from "@/lib/shopify";
import HeroSection, {
  HERO_SECTION_TYPE,
} from "@/components/sections/HeroSection/HeroSection";
import ProjectRouteSection, {
  PROJECT_ROUTE_TYPE,
} from "@/components/sections/ProjectRouteSection/ProjectRouteSection";
import RichTextWithStatsSection, {
  RICH_TEXT_WITH_STATS_TYPE,
} from "@/components/sections/RichTextWithStatsSection/RichTextWithStatsSection";
import SolutionsSection, {
  SOLUTIONS_TYPE,
} from "@/components/sections/SolutionsSection/SolutionsSection";
import CaseStudiesSection, {
  CASE_STUDIES_TYPE,
} from "@/components/sections/CaseStudiesSection/CaseStudiesSection";
import { cmsPageSeo, pageMetadata } from "@/lib/seo";
import "./page.css";

export async function generateMetadata() {
  const page = await getServicesPage();

  return pageMetadata({ path: "/services", ...cmsPageSeo(page) });
}

// The services `content` entry's component slots, in the order the admin shows
// them (Component 1 … Component 6). The query aliases the live field keys onto
// these names — see queries/pages/services.js for why the keys don't match
// their labels.
const COMPONENT_SLOTS = [
  "component1",
  "component2",
  "component3",
  "component4",
  "component5",
  "component6",
];

const HERO_ARTWORK = "/assets/Headline section (2).svg";

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
            return (
              <HeroSection
                key={section.id}
                section={section}
                artwork={HERO_ARTWORK}
              />
            );
          case PROJECT_ROUTE_TYPE:
            return <ProjectRouteSection key={section.id} section={section} />;
          case RICH_TEXT_WITH_STATS_TYPE:
            return (
              <RichTextWithStatsSection key={section.id} section={section} />
            );
          case SOLUTIONS_TYPE:
            return <SolutionsSection key={section.id} section={section} />;
          case CASE_STUDIES_TYPE:
            return <CaseStudiesSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
