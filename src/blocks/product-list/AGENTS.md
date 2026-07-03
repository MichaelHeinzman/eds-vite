# Catalog Feature Instructions

- Catalog UI consumes normalized `Product` values from `src/services/products.ts`.
- Never couple product components directly to Adobe Commerce or DummyJSON payloads.
- Keep listing filters and sorting client-side while fixture datasets remain small.
- Product links use `/products/:id`; dynamic mock routing is handled in `src/mocks/pages.ts`.
- Update the root README whenever catalog routes, providers, or product contracts change.
