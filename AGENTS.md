# AGENTS.md

## Architecture

This repository is an Adobe Experience Manager Edge Delivery Services runtime built with Vite, Preact, TypeScript, global CSS, and progressive enhancement.

- AEM owns authored HTML and routing.
- `head.html` loads browser-ready assets from `aem-dist/`.
- `src/scripts.ts` owns page bootstrap.
- `src/aem.ts` owns section/block decoration and lazy block loading.
- Domain-specific behavior belongs in `src/blocks/`; reusable runtime helpers belong in `src/utils/`.

## Blocks

Blocks are discovered with `import.meta.glob("./blocks/*/*.{ts,tsx,js,jsx}")`. Each block exports a default decorator and imports its own global stylesheet. Use Preact for structured or stateful UI and vanilla TypeScript for small authored-DOM transformations.

Block status must transition through `initialized`, `loading`, and `loaded` or `error`. Preserve authored semantic HTML and avoid unnecessary wrappers. Likely LCP images must use eager loading and high fetch priority; below-the-fold imagery remains lazy.

## Development

`npm run dev` reads `aem.config.json`, runs the AEM Vite build in watch mode, and starts `aem up` against the configured environment. Do not add a root `index.html`, local mock pages, static route generators, or deployment-provider rewrites; those shadow AEM-authored routes.

## CSS and build

Use global CSS, not CSS Modules or runtime CSS loaders. Shared foundation CSS lives under `src/styles/`; block CSS stays colocated and code-split. The AEM build must retain stable entry filenames, lazy hashed chunks, minification, and compression.

Update `README.md` whenever setup, commands, structure, blocks, routing, or build behavior changes.
