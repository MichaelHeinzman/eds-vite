# Customer Account

- Customer GraphQL and token storage belong in `src/services/customer.ts`.
- Never persist customer tokens in local storage; this demo uses session storage. Production storefronts should prefer secure server-managed cookies.
- Keep account forms independently removable from page runtime and cart/catalog UI.
- Signed-in wishlist operations use the customer token through `src/services/wishlist.ts`; guest favorites remain local.
