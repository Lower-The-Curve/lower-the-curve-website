// Barrel for per-page query modules. Add one file per page (home.js,
// services.js, ...) and re-export it here. queries/index.js re-exports this
// folder, so helpers still import from '@/lib/shopify/queries' or './queries'.
export * from './home';
export * from './services';
