// Type lives apart from the client tabs file because the page — a Server
// Component — needs the plain string to dispatch on. Its GraphQL fragment lives
// in lib/shopify/queries/sections/projectRoute.js.
//
// Live Admin / Storefront keys (verified in Postman):
//   project_route       title, description, steps, columns, default_tab,
//                       show_tabs, gray_bubble, green_bubble
//   project_route_step  title, cards
//   project_route_card  title, description, icon (file_reference → MediaImage)
//
// gray_bubble / green_bubble are file_reference on the SECTION.
export const PROJECT_ROUTE_TYPE = "project_route";
