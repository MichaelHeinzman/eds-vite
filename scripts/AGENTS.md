# Static Page Generation

- `generate-static-pages.mjs` converts authored EDS fragments in `src/mocks/pages/` into complete Vite HTML entry documents.
- Keep `index.html` as the shared document shell and homepage source.
- Register new static routes in the generator, Vite inputs, local route map, and `vercel.json`.
- Generated root HTML entries are ignored by Git and must never become a second authored source of truth.
