# Product Recommendations

- The authored `recId` is the only required block configuration.
- Keep Adobe request details in `src/services/recommendations.ts`; this block consumes normalized `Product` values only.
- The block must remain optional: removing it from authored HTML must remove the feature without changing page or runtime code.
- When no recommendations endpoint is configured, deterministic catalog products provide local-development content.
