import { expect, test } from "vitest";

import { rewriteStaticPage } from "../../vite.config";

test("rewrites clean and dynamic authored routes", () => {
  expect(rewriteStaticPage("/docs?mode=test")).toBe("/docs.html?mode=test");
  expect(rewriteStaticPage("/products/CHAIR-1")).toBe("/product.html");
  expect(rewriteStaticPage("/wishlist")).toBe("/wishlist.html");
  expect(rewriteStaticPage("/account")).toBe("/account.html");
  expect(rewriteStaticPage("/unknown")).toBe("/unknown");
});
