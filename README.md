# EDS Vite

A modern Adobe Edge Delivery Services-style runtime built with Vite, Preact, TypeScript, and Adobe Spectrum Web Components.

The project preserves EDS semantic HTML authoring and progressive block enhancement while using Vite for development, bundling, lazy loading, and deployment.

## Features

- Vite development server and production build
- Preact for structured and stateful interfaces
- Adobe Spectrum Web Components for accessible UI primitives
- Dynamic block loading through `import.meta.glob`
- EDS-style section and block decoration
- Responsive images, video, and media preloading
- Local page fixtures for development without an EDS backend
- Switchable Adobe Commerce-shaped and DummyJSON commerce providers
- Vercel SPA routing for direct access to mock routes
- Flash prevention while authored blocks are loading

## Local pages

| Route | Source | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Authored homepage fixture |
| `/docs` | `src/mocks/pages/docs.html` | Runtime documentation |
| `/blocks` | `src/mocks/pages/blocks.html` | Block catalog and contracts |
| `/github` | `src/mocks/pages/github.html` | Repository information |
| `/cart` | `src/mocks/pages/cart.html` | Mock cart page |
| `/products` | `src/mocks/pages/products.html` | Searchable and sortable product listing |
| `/products/:id` | `src/mocks/pages/product.html` | Dynamic product detail page |

Non-home fixtures are loaded by `src/mocks/pages.ts` before EDS decoration begins. Each fixture uses the same semantic section and block structure expected from authored EDS content.

## Commerce backends

Use the Commerce backend selector in the header to switch providers. The selection is stored in `localStorage` and is shared by the mini cart and cart page.

### Adobe Commerce

The Adobe option is currently a local, deterministic fixture. It does **not** make a live request to Adobe or a Luma storefront.

`src/mocks/commerce/adobe-cart.ts` models an Adobe Commerce GraphQL `cart` response using fields such as:

- `itemsV2`
- `CartItemPrices`
- `Money`
- `subtotal_excluding_tax`
- `grand_total`
- GraphQL `__typename` values

The fixture uses product names and SKUs from Adobe's Luma sample data. `src/services/cart.ts` adapts the GraphQL-shaped response into the small UI-facing `Cart` model.

### DummyJSON

The DummyJSON option makes a live browser request to:

```text
https://dummyjson.com/products/category/furniture?limit=4
```

The response is normalized by the same cart service. This keeps UI components independent of either backend's payload shape.

## Catalog

The product listing and detail pages use `src/services/products.ts`. The service returns the normalized `Product` contract regardless of the selected backend.

- Adobe mode uses deterministic Luma-inspired fixtures from `src/mocks/commerce/adobe-products.ts`.
- DummyJSON mode fetches live furniture products and product details.
- `/products` supports client-side search and sorting.
- `/products/:id` renders product media, pricing, inventory state, quantity selection, and purchase actions.

## Local cart store

Cart behavior is fully functional without a backend. `src/services/cart.ts` persists a separate cart for each selected provider in `localStorage` and exposes provider-neutral operations for adding products, changing quantities, removing items, resetting data, and subscribing to updates.

The header count, mini cart, product page, and full cart page synchronize through a lightweight browser event. This local store is intentionally isolated behind the service boundary so it can be removed when real Adobe Commerce mutations are connected.

## Project structure

```text
src/
  main.ts                 EDS runtime and page bootstrap
  spectrum.ts             Spectrum component registration and theme
  assets/                 Bundled icons and media
  blocks/                 Independently loaded EDS blocks
  components/             Shared Preact components
  mocks/
    commerce/             Backend-shaped commerce fixtures
    pages/                Authored page fixtures
    pages.ts              Local route-to-fixture mapping
  services/               Data access and backend adapters
  styles/                 Global layout and application CSS
  types/                  UI and backend contracts
  utils/                  Authoring, metadata, and media helpers
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. Vite hot module replacement updates the in-app browser as files change.

## Production

```bash
npm run build
npm run preview
```

`vercel.json` rewrites application routes to `index.html`, allowing direct navigation and refreshes on `/docs`, `/blocks`, `/github`, and `/cart`.

## Block lifecycle

Blocks transition through:

```text
initialized -> loading -> loaded
                       -> error
```

Authored block markup stays hidden while a block is initialized or loading. It becomes visible only after the block is loaded or reports an error.

Each block exports a default decorator:

```ts
export default async function decorate(block: HTMLElement) {
  // Read authored rows and progressively enhance the block.
}
```

## Adding a mock page

1. Create an EDS-shaped HTML fixture under `src/mocks/pages/`.
2. Import and register it in `src/mocks/pages.ts`.
3. Add the route to the header if it should be navigable.
4. Update this README with the route and purpose.

## Documentation policy

The README is part of the feature contract. Update it whenever a change affects architecture, setup, routes, dependencies, runtime behavior, backend integrations, deployment, or developer workflow.

Major feature folders should contain a scoped `AGENTS.md` describing their contracts and local conventions. Nested instructions supplement the root `AGENTS.md` and apply to everything below their folder.

## Repository

[github.com/MichaelHeinzman/eds-vite](https://github.com/MichaelHeinzman/eds-vite)
