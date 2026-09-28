export { default } from "./ProjectRouteTabs";

// The project route section is a single metaobject with:
//   - `title`         : single_line_text_field, the heading (accent markup)
//   - `description`   : multi_line_text_field, the lede
//   - `steps`         : list.metaobject_reference -> project_route_step, each
//                       carrying `title` and `cards`
//   - `columns`       : number_integer, 2–4 cards per row
//   - `default_tab`   : number_integer, 1-based tab to open
//   - `show_tabs`     : boolean
//   - `gray_bubble`   : file_reference, decorative glow on the section
//   - `green_bubble`  : file_reference, decorative glow on the section
//   - `glow_layout`   : single_line_text_field, "default" | "split"
//
// Nested types (read through the reference lists, not dispatched on):
//   project_route_step  title, cards
//   project_route_card  title, description, icon (file_reference → MediaImage)
//
// The constant lives here, not in ProjectRouteTabs.js, because that is a
// Client Component ('use client') and the page — a Server Component — needs
// the plain string to dispatch on. Its GraphQL fragment lives in
// lib/shopify/queries/sections/projectRoute.js.
export const PROJECT_ROUTE_TYPE = "project_route";
