# AGENTS.md

## Overview

EDS Preact is a modern runtime for Adobe Edge Delivery Services (EDS) built with:

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

1. Preact components
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
  aem.ts

  assets/
  blocks/
  components/
  styles/
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

`main.ts` should remain a thin bootstrapper.

Typical flow:

```ts
decorateMain(main);
loadPage();
```

Business logic belongs in `aem.ts` or `utils/`.

---

# aem.ts Responsibilities

Owns the page runtime.

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

Avoid placing reusable helpers in this file.

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
