# AEM Development Scripts

- `dev-aem.mjs` reads `aem.config.json` and supervises the Vite build watcher and AEM reverse proxy.
- Keep process startup cross-platform and terminate both child processes when either fails or the user stops development.
- AEM owns authored HTML and routes; scripts in this folder must not generate local page documents.
