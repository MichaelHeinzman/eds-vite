import { afterEach, expect, test, vi } from "vitest";
import { clearAdobeCommerceConfig, getAdobeCommerceConfig, saveAdobeCommerceConfig } from "@services/adobe-config";
import { fetchProductSearch } from "@services/products";

const criteria = { phrase: "chair", sort: "price-asc" as const, filters: { color: ["blue"] }, ranges: { price: { from: 5, to: 45 } } };
afterEach(() => { clearAdobeCommerceConfig(); vi.restoreAllMocks(); });

test("uses Catalog Service productSearch products and facets directly", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { productSearch: { total_count: 1, items: [{ productView: { sku: "CHAIR-1", name: "Chair", inStock: true, images: [], price: { final: { amount: { value: 499, currency: "USD" } } } } }], facets: [{ title: "Categories", attribute: "categories", buckets: [{ __typename: "CategoryView", title: "chairs", name: "Chairs", path: "furniture/chairs", count: 4 }] }, { title: "Price", attribute: "price", buckets: [{ __typename: "RangeBucket", title: "0-50", from: 0, to: 50, count: 4 }] }] } } }), { status: 200 }));
  const result = await fetchProductSearch(criteria);
  expect(result.facets[0]).toEqual({ attribute: "categories", title: "Categories", kind: "scalar", options: [{ value: "furniture/chairs", title: "Chairs", count: 4 }] });
  expect(result.facets[1]).toMatchObject({ attribute: "price", kind: "range", min: 0, max: 50 });
  expect(result.products[0].sku).toBe("CHAIR-1");
  const request = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
  expect(request.query).toContain("productView"); expect(request.variables.filter).toEqual([{ attribute: "color", in: ["blue"] }, { attribute: "price", range: { from: 5, to: 45 } }]);
});

test("uses Magento products aggregations and sends selected filters", async () => {
  saveAdobeCommerceConfig({ ...getAdobeCommerceConfig(), catalogMode: "core" });
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: { products: { total_count: 1, items: [{ sku: "CHAIR-1", name: "Chair", stock_status: "IN_STOCK", description: { html: "A chair" }, price_range: { minimum_price: { final_price: { value: 499, currency: "USD" } } } }], aggregations: [{ attribute_code: "color", label: "Color", count: 1, options: [{ label: "Blue", value: "blue", count: 1 }] }] } } }), { status: 200 }));
  const result = await fetchProductSearch(criteria);
  expect(result.facets[0].options[0].count).toBe(1);
  const request = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
  expect(request.query).toContain("aggregations"); expect(request.variables.filter).toEqual({ color: { eq: "blue" }, price: { from: "5", to: "45" } });
});
