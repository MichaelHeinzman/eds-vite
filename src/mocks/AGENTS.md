# Mock Data Instructions

These instructions apply to `src/mocks/` and its descendants.

- Page fixtures belong in `pages/` and must preserve EDS-shaped semantic HTML.
- Register every routable fixture in `pages.ts`.
- Commerce fixtures belong in `commerce/` and should mirror the source backend contract rather than the normalized UI model.
- Keep fixtures deterministic unless the feature explicitly tests randomized behavior.
- Clearly document whether a fixture is local or fetched from a live service.
- When adding or changing mock pages, providers, or fixture formats, update the root README.
