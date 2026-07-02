# EDS Vite

A modern runtime for Adobe Edge Delivery Services (EDS) built with Vite, Preact, and TypeScript.

## Features

- ⚡ Vite-powered
- 🧩 Dynamic block loading with `import.meta.glob`
- 📝 Preserves the EDS authoring model
- 🎨 Global CSS
- 📦 Lazy-loaded blocks
- 🚀 Vanilla JS first
- ⚛️ Preact only where interactive state is beneficial
- 🖼️ Responsive images and video support
- 🔧 TypeScript

## Project Structure

```
src/
  main.ts
  blocks/
  components/
  utils/
  styles/
  assets/
```

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Philosophy

EDS Vite preserves the Adobe Edge Delivery Services authoring experience while replacing the traditional runtime with a modern Vite-based architecture.

Authors continue to author HTML, while blocks progressively enhance the markup using vanilla JavaScript or Preact when interactive state is required.
