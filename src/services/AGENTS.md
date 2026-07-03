# Service Layer Instructions

These instructions apply to `src/services/` and its descendants.

- Services are the boundary between UI components and external or mocked backends.
- Normalize provider-specific payloads into stable UI-facing types.
- Do not expose Adobe Commerce or future backend response shapes directly to components.
- Adobe Commerce is currently the only registered backend. Preserve the provider boundary when changing services so future adapters can be added without changing components.
- Include the selected provider in query-cache keys.
- Keep live network providers replaceable and preserve a deterministic local development path.
- Local cart persistence and mutations stay behind `cart.ts`; components subscribe through the exported service API rather than reading `localStorage` directly.
- New major integrations require strong TypeScript contracts, failure handling, README updates, and a scoped `AGENTS.md` when they introduce a new feature folder.
