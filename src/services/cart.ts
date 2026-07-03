import { adobeCartFixture } from "@/mocks/commerce/adobe-cart";
import type { AdobeCart } from "@/types/adobe-commerce";
import type { Cart } from "@/types/cart";
import type { Product } from "@/types/catalog";

export type CommerceBackend = "adobe" | "dummyjson";

const backendStorageKey = "eds-vite-commerce-backend";
const cartChangeEvent = "eds-vite:cart-change";

function cartStorageKey() {
  return `eds-vite-cart:${getCommerceBackend()}`;
}

function calculateCart(cart: Cart): Cart {
  return {
    ...cart,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: cart.items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

function readStoredCart(): Cart | null {
  try {
    const value = window.localStorage.getItem(cartStorageKey());
    return value ? calculateCart(JSON.parse(value) as Cart) : null;
  } catch {
    return null;
  }
}

function saveCart(cart: Cart) {
  const nextCart = calculateCart(cart);
  window.localStorage.setItem(cartStorageKey(), JSON.stringify(nextCart));
  window.dispatchEvent(new CustomEvent<Cart>(cartChangeEvent, { detail: nextCart }));
  return nextCart;
}

export function getCommerceBackend(): CommerceBackend {
  const saved = window.localStorage.getItem(backendStorageKey);
  return saved === "dummyjson" ? "dummyjson" : "adobe";
}

export function setCommerceBackend(backend: CommerceBackend) {
  window.localStorage.setItem(backendStorageKey, backend);
}

function adaptAdobeCart(source: AdobeCart): Cart {
  return {
    id: source.id,
    itemCount: source.total_quantity,
    subtotal: source.prices.subtotal_excluding_tax.value,
    items: source.itemsV2.items.map((item) => ({
      id: item.uid,
      sku: item.product.sku,
      name: item.product.name,
      image: item.product.small_image?.url,
      price: item.prices.price.value,
      quantity: item.quantity,
      options: item.configurable_options.map(
        (option) => `${option.option_label}: ${option.value_label}`,
      ),
    })),
  };
}

async function fetchAdobeCart(): Promise<Cart> {
  // Mimic GraphQL latency while keeping local development deterministic.
  await new Promise((resolve) => setTimeout(resolve, 300));
  return adaptAdobeCart(adobeCartFixture.data.cart);
}

type DummyJsonProduct = {
  id: number;
  title: string;
  sku: string;
  price: number;
  thumbnail: string;
  brand?: string;
  category: string;
};

type DummyJsonProductsResponse = {
  products: DummyJsonProduct[];
};

async function fetchDummyJsonCart(): Promise<Cart> {
  const response = await fetch("https://dummyjson.com/products/category/furniture?limit=4");
  if (!response.ok) throw new Error(`DummyJSON request failed: ${response.status}`);

  const data = (await response.json()) as DummyJsonProductsResponse;
  const products = data.products.slice(0, 3);
  const quantities = [1, 2, 1];
  const items = products.map((product, index) => ({
    id: String(product.id),
    sku: product.sku || `DUMMY-${product.id}`,
    name: product.title,
    image: product.thumbnail,
    price: product.price,
    quantity: quantities[index] || 1,
    options: [product.brand || "Furniture", product.category],
  }));

  return {
    id: "dummyjson-furniture-cart",
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

export async function fetchCart(): Promise<Cart> {
  const storedCart = readStoredCart();
  if (storedCart) return storedCart;

  const seedCart = getCommerceBackend() === "dummyjson"
    ? await fetchDummyJsonCart()
    : await fetchAdobeCart();

  return saveCart(seedCart);
}

export function getCart() {
  return fetchCart();
}

export async function addProductToCart(product: Product, quantity = 1) {
  const cart = await getCart();
  const existing = cart.items.find((item) => item.sku === product.sku);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      options: [product.category],
    });
  }

  return saveCart(cart);
}

export async function updateCartItem(itemId: string, quantity: number) {
  const cart = await getCart();
  const item = cart.items.find((candidate) => candidate.id === itemId);
  if (!item) return cart;
  item.quantity = Math.max(1, quantity);
  return saveCart(cart);
}

export async function removeCartItem(itemId: string) {
  const cart = await getCart();
  cart.items = cart.items.filter((item) => item.id !== itemId);
  return saveCart(cart);
}

export function subscribeCart(listener: (cart: Cart) => void) {
  const onChange = (event: Event) => listener((event as CustomEvent<Cart>).detail);
  window.addEventListener(cartChangeEvent, onChange);
  return () => window.removeEventListener(cartChangeEvent, onChange);
}

export function resetCart() {
  window.localStorage.removeItem(cartStorageKey());
  return fetchCart();
}
