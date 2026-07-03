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
- Adobe Commerce integration with a provider boundary that remains extensible
- Vercel SPA routing for direct access to mock routes
- Flash prevention while authored blocks are loading
- Layout-matched loading skeletons for the product list, product detail, and cart pages

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
| `/commerce-settings` | `src/mocks/pages/commerce-settings.html` | Adobe Commerce connection settings |

Non-home fixtures are loaded by `src/mocks/pages.ts` before EDS decoration begins. Each fixture uses the same semantic section and block structure expected from authored EDS content.

## Commerce backends

Use the settings button in the header to open the Adobe Commerce configuration modal. Adobe Commerce is the only registered backend; the service boundary remains provider-neutral so another adapter can be added later without rewriting the UI. The same configuration experience is also available at `/commerce-settings` as a full page.

### Adobe Commerce

The checked-in defaults use `https://www.aemshop.net/graphql` for Core Commerce and `https://www.aemshop.net/cs-graphql` for Catalog Service. Catalog Service is selected by default with the supplied environment ID, API key, website code, store code, and store-view code. They can be replaced from the header settings modal, at `/commerce-settings`, or through the `VITE_ADOBE_*` variables documented in `.env.example`.

Two catalog modes are supported:

- **Core Magento / Adobe Commerce GraphQL:** catalog queries and all cart mutations use the merchant's core `<commerce-url>/graphql` endpoint.
- **Adobe Catalog Service:** product reads use the configured Catalog Service endpoint and Magento context headers. Cart reads and mutations still use core Commerce GraphQL because Storefront Services are read-only.

Implemented core operations include product listing, product-by-SKU, guest-cart creation, cart retrieval, `addProductsToCart`, `updateCartItems`, and `removeItemFromCart`.

Configuration checklist:

- **Core GraphQL endpoint:** required in every real Adobe mode. For Magento Open Source and Adobe Commerce on-premises/PaaS this is normally the store's `/graphql` endpoint. It remains required with Catalog Service because carts and checkout are core mutations.
- **Store view and currency:** sent as the `Store` and `Content-Currency` headers on core GraphQL requests.
- **Catalog mode:** use core GraphQL for Magento Open Source or a traditional Adobe Commerce installation; choose Catalog Service when the storefront is backed by Adobe's SaaS catalog, including Adobe Commerce as a Cloud Service.
- **Catalog Service endpoint and SKUs:** the endpoint is required when Catalog Service mode is selected. A comma-separated PLP seed list is optional; when omitted, Core GraphQL supplies the current page of SKUs before Catalog Service hydrates them.
- **Catalog context:** Catalog Service requests send `Magento-Environment-Id`, `Magento-Website-Code`, `Magento-Store-Code`, `Magento-Store-View-Code`, and `Magento-Customer-Group`. PaaS integrations may also require the storefront-safe `X-Api-Key` supplied for the service.
- **Browser access:** the Commerce and Catalog Service endpoints must permit the storefront origin through CORS.

Catalog Service is a read-optimized service and does not replace core cart or checkout GraphQL. A production PLP will commonly use Live Search's `productSearch`; this reference implementation intentionally uses Catalog Service `products(skus:)` so it can demonstrate product reads without requiring a complete search configuration.

Only enter storefront-safe configuration. `VITE_*` values and browser `localStorage` are public to the shopper; never place Admin tokens, private integration credentials, or customer tokens in them.

## Catalog

The product listing and detail pages use `src/services/products.ts`. The service returns a normalized `Product` contract regardless of the configured Adobe catalog source.

- Product reads query the configured Core GraphQL or Catalog Service endpoint.
- A Catalog Service PDP sends `variables: { skus: [requestedSku] }` directly to `products(skus:)`.
- Product URLs preserve the canonical SKU casing because Catalog Service SKU matching is case-sensitive.
- For a Catalog Service PLP, configured SKUs are used when supplied; otherwise Core GraphQL supplies the page of SKUs and Catalog Service hydrates those products.
- `/products` supports client-side search and sorting.
- `/products/:id` renders product media, pricing, inventory state, quantity selection, and purchase actions.

## Cart service

`src/services/cart.ts` exposes provider-neutral operations for adding products, changing quantities, removing items, resetting data, and subscribing to updates. The registered Adobe adapter calls Core Commerce GraphQL and stores only the guest cart ID locally.

The header count, mini cart, product page, and full cart page synchronize through a lightweight browser event. UI components remain independent of Adobe response shapes so additional adapters can be registered later.

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
