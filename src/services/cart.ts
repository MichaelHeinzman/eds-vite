import type { Cart } from "@/types/cart";
import type { Product } from "@/types/catalog";
import { isAdobeCommerceConfigured } from "@services/adobe-config";
import { addRemoteAdobeCartItem, fetchRemoteAdobeCart, removeRemoteAdobeCartItem, resetRemoteAdobeCart, updateRemoteAdobeCartItem } from "@services/adobe-cart-api";

export const commerceBackends = ["adobe"] as const;
export type CommerceBackend = (typeof commerceBackends)[number];

const backendStorageKey = "eds-vite-commerce-backend";
const cartChangeEvent = "eds-vite:cart-change";

function cartStorageKey() {
  return `eds-vite-cart:${getCommerceBackend()}`;
}

export function getCommerceBackend(): CommerceBackend {
  const saved = window.localStorage.getItem(backendStorageKey);
  return commerceBackends.includes(saved as CommerceBackend) ? saved as CommerceBackend : "adobe";
}

export function setCommerceBackend(backend: CommerceBackend) {
  window.localStorage.setItem(backendStorageKey, backend);
}

export async function fetchCart(): Promise<Cart> {
  if (!isAdobeCommerceConfigured()) throw new Error("Configure Adobe Commerce before loading the cart.");
  return fetchRemoteAdobeCart();
}

export function getCart() {
  return fetchCart();
}

export async function addProductToCart(product: Product, quantity = 1) {
  return notifyCart(await addRemoteAdobeCartItem(product.sku, quantity));
}

export async function updateCartItem(itemId: string, quantity: number) {
  return notifyCart(await updateRemoteAdobeCartItem(itemId, quantity));
}

export async function removeCartItem(itemId: string) {
  return notifyCart(await removeRemoteAdobeCartItem(itemId));
}

export function subscribeCart(listener: (cart: Cart) => void) {
  const onChange = (event: Event) => listener((event as CustomEvent<Cart>).detail);
  window.addEventListener(cartChangeEvent, onChange);
  return () => window.removeEventListener(cartChangeEvent, onChange);
}

export function resetCart() {
  resetRemoteAdobeCart();
  window.localStorage.removeItem(cartStorageKey());
  return fetchCart();
}

function notifyCart(cart: Cart) {
  window.dispatchEvent(new CustomEvent<Cart>(cartChangeEvent, { detail: cart }));
  return cart;
}
