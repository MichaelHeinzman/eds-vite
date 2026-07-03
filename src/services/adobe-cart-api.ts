import { ADD_TO_CART_MUTATION, adobeGraphQl, CART_QUERY, CREATE_CART_MUTATION, REMOVE_CART_MUTATION, UPDATE_CART_MUTATION } from "@services/adobe-graphql";
import type { Cart } from "@/types/cart";

const cartIdKey = "eds-vite-adobe-cart-id";

type RemoteCart = {
  id: string;
  total_quantity: number;
  itemsV2: { items: Array<{ uid: string; quantity: number; product: { sku: string; name: string; small_image?: { url: string } }; prices: { price: { value: number } } }> };
  prices: { subtotal_excluding_tax: { value: number } };
};

function normalize(cart: RemoteCart): Cart {
  return { id: cart.id, itemCount: cart.total_quantity, subtotal: cart.prices.subtotal_excluding_tax.value, items: cart.itemsV2.items.map((item) => ({ id: item.uid, sku: item.product.sku, name: item.product.name, image: item.product.small_image?.url, price: item.prices.price.value, quantity: item.quantity })) };
}

async function cartId() {
  const saved = window.localStorage.getItem(cartIdKey);
  if (saved) return saved;
  const data = await adobeGraphQl<{ createGuestCart: { cart: { id: string } } }>(CREATE_CART_MUTATION);
  window.localStorage.setItem(cartIdKey, data.createGuestCart.cart.id);
  return data.createGuestCart.cart.id;
}

export async function fetchRemoteAdobeCart() {
  const id = await cartId();
  const data = await adobeGraphQl<{ cart: RemoteCart }>(CART_QUERY, { id });
  return normalize(data.cart);
}

export async function addRemoteAdobeCartItem(sku: string, quantity: number) {
  const id = await cartId();
  await adobeGraphQl(ADD_TO_CART_MUTATION, { cartId: id, items: [{ sku, quantity }] });
  return fetchRemoteAdobeCart();
}

export async function updateRemoteAdobeCartItem(itemId: string, quantity: number) {
  const id = await cartId();
  await adobeGraphQl(UPDATE_CART_MUTATION, { cartId: id, items: [{ cart_item_uid: itemId, quantity }] });
  return fetchRemoteAdobeCart();
}

export async function removeRemoteAdobeCartItem(itemId: string) {
  const id = await cartId();
  await adobeGraphQl(REMOVE_CART_MUTATION, { cartId: id, itemId });
  return fetchRemoteAdobeCart();
}

export function resetRemoteAdobeCart() { window.localStorage.removeItem(cartIdKey); }
