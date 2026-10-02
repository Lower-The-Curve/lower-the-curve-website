// Barrel for section fragments. Add one file per section type (hero.js,
// partners.js, ...) and re-export it here so page queries can import from
// '../sections'. The header and footer live here too; they also carry their own
// query, because they fetch themselves rather than through a page.
//
// Nothing in here imports from src/components — keep it that way. lib/shopify is
// reached from the root layout (Header and Footer fetch through it), so a
// component imported by a query lands in every page's module graph, CSS and all,
// and a 'use client' component can't hand a fragment to the server at all.
export * from './hero';
export * from './partners';
export * from './solutions';
export * from './testimonials';
export * from './caseStudies';
export * from './banner';
export * from './projectRoute';
export * from './richTextWithStats';
export * from './featureCards';
export * from './statsGrid';
export * from './partnerDetail';
export * from './header';
export * from './footer';
export * from './delivered';
export * from './whatWeBuilt';
export * from './team';
