# EDS Vite

A modern Adobe Edge Delivery Services-style runtime built with Vite, Preact, TypeScript, and Adobe Spectrum Web Components.

The project preserves EDS semantic HTML authoring and progressive block enhancement while using Vite for development, bundling, lazy loading, and deployment.

## Features

- Vite development server and production build
- Preact for structured and stateful interfaces
- Adobe Spectrum Web Components for accessible UI primitives
- Warm, retail-focused visual theme with a generated EDS Market brand mark
- Dynamic block loading through `import.meta.glob`
- EDS-style section and block decoration
- Responsive images, video, and media preloading
- Real EDS-authored HTML entry documents generated for each local route
- Adobe Commerce integration with a provider boundary that remains extensible
- Vercel static-document rewrites for direct access to EDS routes
- Flash prevention while authored blocks are loading
- Layout-matched loading skeletons for the product list, product detail, and cart pages
- Eager, high-priority loading for likely LCP images and awaited sequential block decoration
- Vitest unit/component tests and Playwright desktop/mobile browser journeys
- Responsive mobile navigation, compact commerce layouts, and visible pending/error feedback for cart mutations
- Adobe Commerce customer login, account creation, and password-reset flows
- Removable wishlist, recommendation blocks, URL-persisted PLP facets, and commerce JSON-LD

## Local pages

| Route | Source | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Authored homepage fixture |
| `/404.html` | `404.html` | Static not-found document included in production builds |
| `/docs` | `src/mocks/pages/docs.html` | Runtime documentation |
| `/blocks` | `src/mocks/pages/blocks.html` | Block catalog and contracts |
| `/github` | `src/mocks/pages/github.html` | Repository information |
| `/cart` | `src/mocks/pages/cart.html` | Mock cart page |
| `/wishlist` | `src/mocks/pages/wishlist.html` | Locally saved products |
| `/account` | `src/mocks/pages/account.html` | Adobe Commerce customer authentication |
| `/products` | `src/mocks/pages/products.html` | Searchable and sortable product listing |
| `/products/:id` | `src/mocks/pages/product.html` | Dynamic product detail page |
| `/commerce-settings` | `src/mocks/pages/commerce-settings.html` | Adobe Commerce connection settings |

The HTML fragments in `src/mocks/pages/` are the authored source. `scripts/generate-static-pages.mjs` places each fragment into the shared `index.html` document shell before development or production builds. Vite then builds every document as a separate HTML entry. Vercel only rewrites clean URLs to those static documents; it does not act as the content backend or replace HTML in the browser.

`/products/:sku` rewrites to the shared `product.html` entry. The product-page block reads the canonical SKU from the original browser URL, so one authored PDP document supports every product.

## Commerce backends

Use the settings button in the header to open the Adobe Commerce configuration modal. Adobe Commerce is the only registered backend; the service boundary remains provider-neutral so another adapter can be added later without rewriting the UI. The same configuration experience is also available at `/commerce-settings` as a full page.

### Adobe Commerce

The checked-in defaults use `https://www.aemshop.net/graphql` for Core Commerce and `https://www.aemshop.net/cs-graphql` for Catalog Service. Catalog Service is selected by default with the supplied environment ID, API key, website code, store code, and store-view code. They can be replaced from the header settings modal, at `/commerce-settings`, or through the `VITE_ADOBE_*` variables documented in `.env.example`.

Two catalog modes are supported:

- **Core Magento / Adobe Commerce GraphQL:** catalog queries and all cart mutations use the merchant's core `<commerce-url>/graphql` endpoint.
- **Adobe Catalog Service:** product reads use the configured Catalog Service endpoint and Magento context headers. Cart reads and mutations still use core Commerce GraphQL because Storefront Services are read-only.

Implemented core operations include product listing, product-by-SKU, guest-cart creation, cart retrieval, `addProductsToCart`, `updateCartItems`, and `removeItemFromCart`.

Customer operations use Core Commerce GraphQL: `generateCustomerToken`, `customer`, `createCustomerV2`, `requestPasswordResetEmail`, and `resetPassword`. The demo token lives in `sessionStorage`, never persistent local storage. A production deployment should use a secure, server-managed session where its architecture permits it. Removing the authored `account-page` block and route removes the customer UI; catalog and cart services do not depend on it.

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
- `/products` uses backend search, sorting, and facets rather than deriving filters from the current page of products. Core mode sends Magento `products(search, filter, sort)` and renders `products.aggregations`; Catalog Service mode sends `productSearch` and renders `productSearch.facets`, then hydrates the returned SKUs through Catalog Service `products`. State is encoded in `q`, `sort`, and repeatable `filter[attribute]` query parameters so filtered URLs survive reloads and can be shared.
- `/products/:id` renders product media, pricing, inventory state, quantity selection, and purchase actions.
- PDP media uses an accessible image carousel with previous/next controls, image position, and selectable thumbnails.
- Catalog Service and Core GraphQL complex products expose selectable options and resolve selected values to a concrete variant SKU, price, image, and inventory state.
- Commerce descriptions are converted from authored HTML to display text before rendering in cards or PDP content.

## Cart service

`src/services/cart.ts` exposes provider-neutral operations for adding products, changing quantities, removing items, resetting data, and subscribing to updates. The registered Adobe adapter calls Core Commerce GraphQL and stores only the guest cart ID locally.

The header count, mini cart, product page, and full cart page synchronize through a lightweight browser event. UI components remain independent of Adobe response shapes so additional adapters can be registered later.

Cart item media and names link to `/products/:sku`. The same reusable favorite control appears on product cards, PDPs, cart pages, and the mini cart.

## Wishlist, recommendations, and SEO

Wishlist products are normalized `Product` values managed by `src/services/wishlist.ts`; UI never reads storage or Adobe payloads directly. Guests use browser-local favorites. Authenticated customers read `customer.wishlists` and mutate Adobe Commerce with `createWishlist`, `addProductsToWishlist`, and `removeProductsFromWishlist` using their customer bearer token. `/wishlist` displays the active guest or customer collection. The adapter can be replaced or removed by deleting its block, service, component, and route.

`product-recommendations` is an optional authored block. Its `recId` row identifies an Adobe recommendation unit. The service calls Catalog Service `recommendationsByUnitIds` with the unit ID, current SKU, cart SKUs, and the last 20 locally recorded product views, then normalizes `results[].productsView`. Removing recommendation rows from authored pages disables the feature without runtime changes. A unit can legitimately return no results when it is inactive, has insufficient behavioral data, targets a different store context, or reports `userError`.

Static page generation writes route-specific descriptions, canonical URLs, robots directives, Open Graph/Twitter cards, `robots.txt`, and `sitemap.xml`. Set `SITE_URL` to the production origin during generation; the demo defaults to `https://eds-vite.vercel.app` (custom deployments must also update the homepage canonical and WebSite schema in `index.html`). Cart, wishlist, account, settings, and the generic product shell are excluded from indexing. Product pages replace the shell metadata after data resolves and emit Schema.org `Product`, `Offer`, and `BreadcrumbList`; PLPs emit `ItemList`. The isolated `src/utils/structured-data.ts` helper owns structured data behavior.

## TanStack Query

All Adobe GraphQL traffic is managed by the shared TanStack Query client and provider in `src/services/query-client.ts`. Preact blocks consume provider-neutral service hooks built with `useQuery` and `useMutation`; Vite maps the React adapter to `preact/compat`. Product and cart reads use configuration-aware query keys for caching and request deduplication. Cart writes update the cart query cache on success and expose their pending/error lifecycle directly to the UI. Saving or clearing Commerce configuration removes cached data from the previous backend context.

## Project structure

```text
src/
  aem.ts                  Typed EDS runtime primitives and Vite block loader
  scripts.ts              Project decoration and page bootstrap
  delayed.ts              Postponed, non-critical runtime work
  spectrum.ts             Spectrum component registration and theme
  assets/                 Bundled icons and media
  blocks/                 Independently loaded EDS blocks
  components/             Shared Preact components
  mocks/
    commerce/             Backend-shaped commerce fixtures
    pages/                Authored EDS page fragments
  services/               Data access and backend adapters
  styles/                 Global layout and application CSS
  types/                  UI and backend contracts
  utils/                  Authoring, metadata, and media helpers
```

## Development

The initial global stylesheet is composed in `src/styles/index.css` from focused Adobe EDS baseline files for fonts, tokens, theme/base elements, typography, buttons, media, and section metadata. Blocks and shared components own and import their colocated CSS; global CSS must not carry component selectors. Spectrum Web Components keeps its own global-elements stylesheet and theme registration.

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. Vite hot module replacement updates the in-app browser as files change.

## Testing

Vitest covers deterministic TypeScript and Preact behavior. Playwright runs production-build journeys in desktop Chromium and a Pixel 7 viewport, including horizontal-overflow checks and mobile navigation.

```bash
npm run test            # unit and component tests
npm run test:watch      # Vitest watch mode
npx playwright install chromium # one-time browser install
npm run test:e2e        # desktop and mobile browser tests
npm run test:all        # complete test suite
```

Async commerce controls disable repeat input and expose pending, success, and failure copy through live regions. This keeps slow Adobe Commerce mutations understandable to both visual and assistive-technology users.

GitHub Actions runs Vitest, installs Playwright Chromium, creates the production build, and runs the desktop/mobile E2E suite for every pull request and every push to `main`. A failure in any stage fails the CI check; failed browser runs retain the Playwright report as a workflow artifact for seven days.

## Production

```bash
npm run build
npm run preview
```

`npm run build` generates and bundles one HTML entry per route. `vercel.json` maps clean URLs to those documents, including the dynamic `/products/:sku` pattern. Every response therefore contains its authored EDS HTML before JavaScript runs.

> **Demo hosting only:** the routes in `vercel.json` exist solely to host this repository's local EDS page fixtures on Michael's Vercel deployment. Remove `vercel.json` and the static-page rewrite configuration when connecting the project to a real Adobe Edge Delivery Services backend. EDS should own page routing and authored HTML in that environment.

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

## Adding a static EDS page

1. Create an EDS-shaped HTML fragment under `src/mocks/pages/`.
2. Register it in `scripts/generate-static-pages.mjs`.
3. Add its generated document to the Vite input map and local route map in `vite.config.ts`.
4. Add the production rewrite to `vercel.json`.
5. Add the route to the header when it should be navigable, then update this README.

These steps describe the repository's standalone demo mode. Do not add or retain Vercel page rewrites in a production EDS integration; let EDS resolve the authored route instead.

## Documentation policy

The README is part of the feature contract. Update it whenever a change affects architecture, setup, routes, dependencies, runtime behavior, backend integrations, deployment, or developer workflow.

Major feature folders should contain a scoped `AGENTS.md` describing their contracts and local conventions. Nested instructions supplement the root `AGENTS.md` and apply to everything below their folder.

## Repository

[github.com/MichaelHeinzman/eds-vite](https://github.com/MichaelHeinzman/eds-vite)
