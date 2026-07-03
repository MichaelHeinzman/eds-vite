import { afterEach, expect, test, vi } from "vitest";
import { addToWishlist, fetchWishlist, getWishlist, removeFromWishlist } from "@services/wishlist";
import { setProductListSchema, setProductSchema } from "@utils/structured-data";
import { signIn, signOut } from "@services/customer";
import { fetchRecommendations } from "@services/recommendations";
import { CREATE_CUSTOMER_MUTATION, REQUEST_PASSWORD_RESET_MUTATION, RESET_PASSWORD_MUTATION } from "@services/adobe-graphql";
import type { Product } from "@/types/catalog";

const product: Product = { id: "CHAIR-1", sku: "CHAIR-1", name: "Reading Chair", description: "A chair", category: "Seating", price: 499, currency: "USD", images: [], inStock: true };
afterEach(() => { localStorage.clear(); sessionStorage.clear(); document.head.querySelectorAll('script[data-eds-structured-data]').forEach((node) => node.remove()); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

test("persists and removes normalized wishlist products", () => {
  addToWishlist(product); addToWishlist(product);
  expect(getWishlist()).toEqual([product]);
  removeFromWishlist(product.sku);
  expect(getWishlist()).toEqual([]);
});

test("reads and mutates Adobe Commerce wishlists when authenticated", async () => {
  sessionStorage.setItem("eds-vite-adobe-customer-token", "customer-token");
  const adobeProduct = { sku: "CHAIR-1", name: "Reading Chair", stock_status: "IN_STOCK", description: { html: "<p>A chair</p>" }, small_image: { url: "chair.jpg" }, media_gallery: [{ url: "chair.jpg" }], price_range: { minimum_price: { final_price: { value: 499, currency: "USD" } } } };
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { customer: { wishlists: [{ id: "wishlist-1", items_v2: { items: [] } }] } } }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { addProductsToWishlist: { wishlist: { id: "wishlist-1", items_v2: { items: [{ id: "item-1", quantity: 1, product: adobeProduct }] } }, user_errors: [] } } }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { removeProductsFromWishlist: { wishlist: { id: "wishlist-1", items_v2: { items: [] } }, user_errors: [] } } }), { status: 200 }));
  expect(await fetchWishlist()).toEqual([]);
  expect((await addToWishlist(product)).map((item) => item.sku)).toEqual(["CHAIR-1"]);
  expect(await removeFromWishlist("CHAIR-1")).toEqual([]);
  expect((fetchMock.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBe("Bearer customer-token");
  expect(String(fetchMock.mock.calls[1][1]?.body)).toContain("addProductsToWishlist");
  expect(String(fetchMock.mock.calls[2][1]?.body)).toContain("removeProductsFromWishlist");
});

test("writes valid Product and ItemList JSON-LD", () => {
  setProductSchema(product);
  let schema = JSON.parse(document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("Product"); expect(schema.offers.availability).toContain("InStock");
  setProductListSchema([product]);
  schema = JSON.parse(document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("ItemList"); expect(schema.itemListElement[0].url).toContain("/products/CHAIR-1");
});

test("authenticates through Adobe Commerce and sends the token for customer data", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { generateCustomerToken: { token: "customer-token" } } }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { customer: { firstname: "Ada", lastname: "Lovelace", email: "ada@example.com" } } }), { status: 200 }));
  expect(await signIn({ email: "ada@example.com", password: "secret123" })).toEqual({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
  expect(sessionStorage.getItem("eds-vite-adobe-customer-token")).toBe("customer-token");
  expect((fetchMock.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe("Bearer customer-token");
  signOut(); expect(sessionStorage.getItem("eds-vite-adobe-customer-token")).toBeNull();
});

test("exposes Adobe account creation and both password-reset operations", () => {
  expect(CREATE_CUSTOMER_MUTATION).toContain("createCustomerV2");
  expect(REQUEST_PASSWORD_RESET_MUTATION).toContain("requestPasswordResetEmail");
  expect(RESET_PASSWORD_MUTATION).toContain("resetPassword");
});

test("normalizes Catalog Service productsView recommendations", async () => {
  const recommended = { sku: "CHAIR-1", name: "Reading Chair", inStock: true, images: [], price: { final: { amount: { value: 499, currency: "USD" } } } };
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: { recommendationsByUnitIds: { results: [{ productsView: [recommended], storefrontLabel: "You may like", totalProducts: 1, userError: null }], totalResults: 1 } } }), { status: 200 }));
  expect((await fetchRecommendations("unit-1", "CURRENT-SKU"))[0]).toMatchObject({ sku: "CHAIR-1", price: 499 });
  const request = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
  expect(request.query).toContain("recommendationsByUnitIds");
  expect(request.variables).toMatchObject({ unitIds: ["unit-1"], currentSku: "CURRENT-SKU" });
});
