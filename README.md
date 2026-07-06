# AEM EDS Vite Boilerplate

A Vite, Preact, and TypeScript runtime for Adobe Experience Manager Edge Delivery Services. AEM owns authored HTML and routing; Vite compiles the progressively enhanced blocks referenced by `head.html`.

## Included blocks

- `hero` — responsive AEM Boilerplate hero with an eager, high-priority image
- `columns` — responsive authored two-column rows
- `cards` — responsive authored card grid
- `header` and `footer` — lightweight Preact page chrome

Blocks are discovered through `import.meta.glob` and loaded only when their authored markup occurs on a page. Block styles remain code-split with their block.

## Development

Install the AEM CLI and project dependencies:

```bash
npm install -g @adobe/aem-cli
npm install
```

Configure the proxied AEM environment in `aem.config.json`:

```json
{
  "url": "https://main--aem-eds-vite-boilerplate--michaelheinzman.aem.live/",
  "port": 3000,
  "open": "/"
}
```

Start the complete development environment:

```bash
npm run dev
```

This command runs the optimized Vite build in watch mode and starts `aem up` with the configured URL, port, and initial path. Open `http://localhost:3000/`. AEM supplies each page and merges the local `head.html`; Vite rebuilds `aem-dist/`, and the AEM development server reloads changed assets.

## Production build

```bash
npm run build
```

The AEM build emits stable `aem-dist/scripts.js` and `aem-dist/styles.css` entry assets plus minified, hashed JavaScript and CSS chunks for lazy blocks. Gzip and Brotli variants are generated for assets above the compression threshold.

AEM does not compile TypeScript. Publish `head.html` and the generated `aem-dist/` files with the repository so production pages can load the browser-ready assets.

## Structure

```text
aem.config.json
head.html
scripts/
  dev-aem.mjs
src/
  aem.ts
  scripts.ts
  blocks/
    cards/
    columns/
    footer/
    header/
    hero/
  styles/
  utils/
vite.aem.config.ts
```
