# AGENTS.md

## Overview

EDS Vite is a modern runtime for Adobe Edge Delivery Services (EDS) built with:

- Vite
- Preact
- TypeScript
- Global CSS
- Progressive enhancement

The goal is to preserve the EDS authoring model while replacing the traditional EDS runtime with a modern Vite-based architecture.

Authors continue authoring semantic HTML. Blocks progressively enhance authored markup.

---

# Core Philosophy

Prefer the following:

1. Preact components (Any component that vite supports really but preact is preferred)
2. TypeScript
3. Native browser APIs

Preact is the preferred rendering solution for blocks.

Use vanilla TypeScript when a block only performs small DOM transformations and rendering a component would add unnecessary complexity.

Do not introduce frameworks beyond Preact.

---

# Project Structure

```text
src/
  main.ts
  spectrum.ts

  assets/
  blocks/
  components/
  mocks/
  services/
  styles/
  types/
  utils/
```

Aliases:

```text
@
@assets
@blocks
@components
@styles
@utils
```

---

# Runtime

The runtime is intentionally modeled after Adobe EDS.

`main.ts` currently owns the EDS page runtime and bootstrap flow. Keep new domain-specific business logic in blocks, services, mocks, or utilities rather than growing unrelated logic in this file.

Typical flow:

```ts
decorateMain(main);
loadPage();
```

Reusable runtime helpers belong in `utils/`; domain logic belongs in its block or service.

---

# Runtime Responsibilities

`main.ts` owns the page runtime.

Responsibilities include:

- decorateButtons()
- decorateIcons()
- decorateSections()
- decorateBlocks()
- decorateMain()
- loadBlock()
- loadSection()
- loadSections()
- waitForFirstImage()
- preloadVideoFromSection()
- loadPage()

Avoid placing reusable or commerce-specific helpers in this file.

---

# Block Loading

Blocks are discovered using:

```ts
import.meta.glob("./blocks/*/*.{ts,tsx,js,jsx}");
```

Each block exports a default function:

```ts
export default async function decorate(block: HTMLElement) {}
```

Block lifecycle:

```text
initialized
loading
loaded
error
```

Always update:

```text
data-block-status
```

appropriately.

---

# Section Decoration

Every authored section becomes:

```html
<div class="section"></div>
```

Each direct child is wrapped once.

Do not introduce unnecessary wrapper elements.

Supported section metadata:

- style
- sectionid
- aria-label
- backgroundimage

Metadata should be mapped onto the section and removed from the authored markup.

---

# Block Decoration

Each block receives:

- class="block"
- data-block-name
- data-block-status="initialized"

Text nodes should be wrapped where appropriate.

The existing wrapper receives:

```text
<block>-wrapper
```

The containing section receives:

```text
<block>-container
```

Do not create additional wrapper elements.

---

# Utilities

Reusable helpers belong in:

```text
src/utils/
```

Examples:

- author.ts
- blocks.ts
- media.ts
- metadata.ts

Blocks should import utilities directly.

Example:

```ts
import { readBlockConfig } from "@utils/blocks";
import { createOptimizedPicture } from "@utils/media";
```

Avoid duplicate utility functions.

---

# CSS

Use global CSS.

Do not use CSS Modules.

Each block imports its own stylesheet.

Example:

```ts
import "./hero.css";
```

Vite handles CSS bundling automatically.

Never implement runtime CSS loading.

Adobe Spectrum Web Components is the project component library. Prefer Spectrum primitives for buttons, dialogs, cards, progress states, dividers, and icons. CSS should focus on page composition, responsive layout, and block-specific media treatment.

---

# Mock Pages

Local pages without an EDS backend live in `src/mocks/pages/` and are registered in `src/mocks/pages.ts`.

- `/` continues to use the authored markup in `index.html`.
- Mock fixtures must use EDS-shaped semantic HTML.
- Load fixtures before calling `loadPage()`.
- Update the README route table whenever a page is added, removed, or renamed.

---

# Commerce Providers

Commerce access belongs in `src/services/`. Components consume the normalized UI types from `src/types/cart.ts` and must not depend directly on backend response shapes.

Current providers:

- `adobe`: local Adobe Commerce GraphQL-shaped fixture; not a live Luma API.
- `dummyjson`: live furniture product data from DummyJSON.

Backend-specific contracts and fixtures belong under `src/types/` and `src/mocks/commerce/`. Keep provider switching behind the service boundary.

---

# Documentation Maintenance

Treat `README.md` as part of every architectural or feature change.

Update it when changing:

- setup or commands
- project structure
- routes or mock pages
- dependencies or component libraries
- backend integrations or data contracts
- deployment configuration
- block lifecycle or runtime behavior

When creating a major feature area or a folder with its own architectural contract, add a scoped `AGENTS.md` to that folder. Keep it concise and specific to files below that directory. Do not duplicate the entire root instruction file.

---

# Preact

Preact is the preferred rendering model.

When a block renders structured UI, use a Preact component.

Example:

```tsx
render(<Hero {...props} />, block);
```

Shared UI belongs in:

```text
src/components/
```

Reusable hooks belong in:

```text
src/hooks/
```

Keep components composable and focused.

---

# Vanilla DOM

Vanilla TypeScript is appropriate when a block:

- decorates authored markup
- performs simple DOM manipulation
- has little or no application state

Avoid converting simple decorators into Preact unnecessarily.

---

# Hero Block

The Hero block should remain functionally equivalent to the Havertys implementation.

Support:

- Dynamic Media
- responsive images
- responsive video
- image preloading
- video preloading
- overlay images
- overlay text
- gradients
- frosted glass
- CTA generation
- author data attributes

Maintain feature parity while modernizing implementation.

---

# Performance

Prefer:

- lazy loading
- code splitting
- import.meta.glob()
- dynamic imports
- native browser APIs

Minimize layout thrashing.

Avoid unnecessary DOM mutations.

Use `DocumentFragment` when beneficial.

---

# TypeScript

Prefer:

- explicit interfaces
- discriminated unions
- utility types
- strong typing

Avoid `any` unless absolutely necessary.

---

# Code Style

Prefer:

- small functions
- early returns
- descriptive names
- composition over inheritance

Keep blocks independent.

Avoid deeply nested conditionals.

---

# Dependencies

Prefer browser APIs first.

Only introduce dependencies that provide clear architectural value.

Avoid utility libraries for functionality already available in modern browsers.

---

# Browser Support

Target modern evergreen browsers.

Write modern JavaScript.

Do not add legacy polyfills unless specifically requested.

---

# Architecture Goals

The framework should feel like a modern implementation of Adobe Edge Delivery Services while embracing the Vite ecosystem.

Goals:

- Preserve the EDS authoring experience.
- Prefer Preact for rendering.
- Keep runtime behavior predictable.
- Use progressive enhancement.
- Keep blocks independently loadable.
- Share reusable logic through `utils`.
- Optimize for performance and maintainability.
