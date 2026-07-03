import { expect, test } from "vitest";
import { readProductFilters, serializeProductFilters } from "@blocks/product-list/product-list";

test("round-trips backend facet selections through the query string", () => {
  const filters = readProductFilters("?q=chair&sort=price-asc&filter%5Bcategory_uid%5D=12&filter%5Bcolor%5D=blue&filter%5Bcolor%5D=green&range%5Bprice%5D%5Bfrom%5D=5&range%5Bprice%5D%5Bto%5D=45");
  expect(filters).toEqual({ query: "chair", sort: "price-asc", filters: { category_uid: ["12"], color: ["blue", "green"] }, ranges: { price: { from: 5, to: 45 } } });
  expect(serializeProductFilters(filters)).toBe("q=chair&sort=price-asc&filter%5Bcategory_uid%5D=12&filter%5Bcolor%5D=blue&filter%5Bcolor%5D=green&range%5Bprice%5D%5Bfrom%5D=5&range%5Bprice%5D%5Bto%5D=45");
});
