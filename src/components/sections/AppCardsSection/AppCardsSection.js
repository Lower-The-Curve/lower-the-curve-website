export { default } from "./AppCardsTabs";

// The Shopify Apps grid section. It renders the SAME `project_route` metaobject
// type as the services page's process section, reusing that type's `steps` ->
// `cards` authoring, but as an app card grid with a Learn More dialog per card:
//   - `title`         : single_line_text_field, the heading (accent markup)
//   - `description`   : multi_line_text_field, the lede
//   - `steps`         : list.metaobject_reference -> project_route_step, each
//                       carrying `title` (the tab label) and `cards`
//   - `columns`       : number_integer, cards per row (design: 2)
//   - `default_tab`   : number_integer, 1-based tab to open
//   - `show_tabs`     : boolean
//   - `gray_bubble`   : file_reference, decorative glow top-right
//   - `green_bubble`  : file_reference, decorative glow bottom-left
//
// Each card's `button1` (a metaobject_reference to an app_pop_up) is what makes
// its Learn More button open. Popups are fetched separately by type — see
// lib/shopify/queries/appPopUp.js for why — and arrive as the `popups` prop.
//
// Nested types (read through the reference lists, not dispatched on):
//   project_route_step  title, cards
//   project_route_card  title, description, icon (file_reference -> MediaImage),
//                       show_button (boolean), button1 (metaobject_reference)
//
// The constant lives here, not in AppCardsTabs.js, because that is a Client
// Component ('use client') and the page — a Server Component — needs the plain
// string to dispatch on. Its GraphQL fragment lives in
// lib/shopify/queries/sections/projectRoute.js (shared with ProjectRouteSection).
export const APP_CARDS_SECTION_TYPE = "project_route";

// This section and ProjectRouteSection render the SAME `project_route`
// metaobject type, so the page cannot tell them apart by `section.type` alone:
// an app-cards section is the one whose cards carry a `button1` (or legacy
// `button`) reference — that is what its Learn More button opens. Every other
// project_route is the process section and goes to ProjectRouteSection.
// Exported so the page's switch can dispatch on the data, not the type.
export function isAppCardsSection(section) {
  const steps =
    (section?.fields ?? []).find((field) => field.key === "steps")?.references
      ?.nodes ?? [];

  return steps.some((step) =>
    (step.fields ?? [])
      .filter((field) => field.key === "cards")
      .some((cardsField) =>
        (cardsField.references?.nodes ?? []).some((card) =>
          (card.fields ?? []).some(
            (field) =>
              (field.key === "button1" || field.key === "button") &&
              Boolean(field.reference)
          )
        )
      )
  );
}
