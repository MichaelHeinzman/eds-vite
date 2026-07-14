# AEM EDS Vite Boilerplate

A Vite, Preact, and TypeScript runtime for Adobe Experience Manager Edge Delivery Services. AEM owns authored HTML and routing, while this project builds the browser-ready assets used by `head.html`.

## Environments

- Preview: https://main--{repo}--{owner}.aem.page/
- Live: https://main--{repo}--{owner}.aem.live/

## Installation

```sh
npm install
```

## Build

```sh
npm run build
```

The build type-checks the TypeScript source and writes production assets to `aem-dist/`. AEM does not compile TypeScript, so `head.html` loads the generated `aem-dist/scripts.js` and `aem-dist/styles.css` files directly.

## Local development

1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Install project dependencies: `npm install`
1. Confirm the proxied AEM environment in `aem.config.json`
1. Start local development: `npm run dev`
1. Open `http://localhost:3000/`

`npm run dev` runs the Vite AEM build in watch mode and starts `aem up` against the configured environment. AEM supplies authored pages and merges the local `head.html`; Vite rebuilds `aem-dist/` as source files change.

## Project structure

```text
.
|-- .github/
|   |-- pull_request_template.md
|   `-- workflows/
|-- aem-dist/
|   |-- assets/
|   |-- scripts.js
|   `-- styles.css
|-- models/
|   |-- _cards.json
|   |-- _columns.json
|   |-- _component-definition.json
|   |-- _component-filters.json
|   |-- _component-models.json
|   |-- _hero.json
|   |-- _image.json
|   |-- _page.json
|   |-- _section.json
|   `-- _text.json
|-- scripts/
|   `-- dev-aem.mjs
|-- src/
|   |-- blocks/
|   |   |-- cards/
|   |   |-- columns/
|   |   |-- footer/
|   |   |-- header/
|   |   `-- hero/
|   |-- styles/
|   |-- utils/
|   |-- aem.ts
|   |-- delayed.ts
|   `-- scripts.ts
|-- 404.html
|-- aem.config.json
|-- favicon.svg
|-- head.html
|-- package.json
|-- tsconfig.json
`-- vite.aem.config.ts
```

## Pull requests

Pull requests should include the related GitHub issue and before/after AEM test URLs. The template in `.github/pull_request_template.md` includes the expected format.
