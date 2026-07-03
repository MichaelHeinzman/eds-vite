import { useMutation, useQuery } from "@tanstack/react-query";

import type { Cart } from "@/types/cart";
import type { Product } from "@/types/catalog";
import { isAdobeCommerceConfigured } from "@services/adobe-config";
import { addRemoteAdobeCartItem, fetchRemoteAdobeCart, removeRemoteAdobeCartItem, resetRemoteAdobeCart, updateRemoteAdobeCartItem } from "@services/adobe-cart-api";
import { commerceQueryClient, commerceQueryKeys, runCommerceMutation } from "@services/query-client";

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
  return commerceQueryClient.fetchQuery(cartQueryOptions());
}

function cartQueryOptions() {
  return {
    queryKey: commerceQueryKeys.cart(),
    queryFn: fetchCart,
    staleTime: 15_000,
  };
}

export function useCart(enabled = true) {
  return useQuery({ ...cartQueryOptions(), enabled });
}

export async function addProductToCart(product: Product, quantity = 1) {
  const cart = await runCommerceMutation(
    ["commerce", "adobe", "cart", "add"],
    ({ sku, amount }: { sku: string; amount: number }) => addRemoteAdobeCartItem(sku, amount),
    { sku: product.sku, amount: quantity },
  );
  return updateCartCache(cart);
}

export async function updateCartItem(itemId: string, quantity: number) {
  const cart = await runCommerceMutation(
    ["commerce", "adobe", "cart", "update"],
    ({ id, amount }: { id: string; amount: number }) => updateRemoteAdobeCartItem(id, amount),
    { id: itemId, amount: quantity },
  );
  return updateCartCache(cart);
}

export async function removeCartItem(itemId: string) {
  const cart = await runCommerceMutation(
    ["commerce", "adobe", "cart", "remove"],
    (id: string) => removeRemoteAdobeCartItem(id),
    itemId,
  );
  return updateCartCache(cart);
}

export function useAddProductToCart() {
  return useMutation({
    mutationKey: ["commerce", "adobe", "cart", "add"],
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) => addRemoteAdobeCartItem(product.sku, quantity),
    onSuccess: updateCartCache,
  });
}

export function useUpdateCartItem() {
  return useMutation({
    mutationKey: ["commerce", "adobe", "cart", "update"],
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateRemoteAdobeCartItem(itemId, quantity),
    onSuccess: updateCartCache,
  });
}

export function useRemoveCartItem() {
  return useMutation({
    mutationKey: ["commerce", "adobe", "cart", "remove"],
    mutationFn: (itemId: string) => removeRemoteAdobeCartItem(itemId),
    onSuccess: updateCartCache,
  });
}

export function subscribeCart(listener: (cart: Cart) => void) {
  const onChange = (event: Event) => listener((event as CustomEvent<Cart>).detail);
  window.addEventListener(cartChangeEvent, onChange);
  return () => window.removeEventListener(cartChangeEvent, onChange);
}

export function resetCart() {
  resetRemoteAdobeCart();
  window.localStorage.removeItem(cartStorageKey());
  commerceQueryClient.removeQueries({ queryKey: commerceQueryKeys.cart() });
  return getCart();
}

function updateCartCache(cart: Cart) {
  commerceQueryClient.setQueryData(commerceQueryKeys.cart(), cart);
  return notifyCart(cart);
}

function notifyCart(cart: Cart) {
  window.dispatchEvent(new CustomEvent<Cart>(cartChangeEvent, { detail: cart }));
  return cart;
}
