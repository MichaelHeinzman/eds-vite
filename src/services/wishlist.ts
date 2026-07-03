import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "preact/hooks";

import type { Product } from "@/types/catalog";
import { ADD_TO_WISHLIST_MUTATION, adobeGraphQl, CREATE_WISHLIST_MUTATION, CUSTOMER_WISHLISTS_QUERY, REMOVE_FROM_WISHLIST_MUTATION } from "@services/adobe-graphql";
import { getCustomerToken, isAuthenticated } from "@services/customer";
import { commerceQueryClient, commerceQueryKeys, runCommerceMutation } from "@services/query-client";

const storageKey = "eds-vite-wishlist:v1";
const eventName = "eds-vite:wishlist-change";
type AdobeWishlistProduct = { sku: string; name: string; stock_status: string; description?: { html: string }; small_image?: { url: string }; media_gallery?: Array<{ url: string }>; price_range: { minimum_price: { final_price: { value: number; currency: string } } } };
type AdobeWishlistItem = { id: string; product: AdobeWishlistProduct };
type AdobeWishlist = { id: string; items_v2?: { items: AdobeWishlistItem[] } };
type WishlistMutation = { wishlist: AdobeWishlist; user_errors?: Array<{ message: string }> };
let remoteWishlistId = "";
const remoteItemIds = new Map<string, string>();

function readLocal(): Product[] { try { return JSON.parse(window.localStorage.getItem(storageKey) || "[]") as Product[]; } catch { return []; } }
function publishLocal(items: Product[]) { window.localStorage.setItem(storageKey, JSON.stringify(items)); window.dispatchEvent(new Event(eventName)); return items; }
function text(html = "") { const element = document.createElement("div"); element.innerHTML = html; return (element.textContent || "").trim(); }
function normalizeWishlist(wishlist: AdobeWishlist): Product[] {
  remoteWishlistId = wishlist.id;
  remoteItemIds.clear();
  return (wishlist.items_v2?.items || []).map(({ id, product }) => {
    remoteItemIds.set(product.sku, id);
    const amount = product.price_range.minimum_price.final_price;
    const images = product.media_gallery?.map((image) => image.url) || (product.small_image?.url ? [product.small_image.url] : []);
    return { id: product.sku, sku: product.sku, name: product.name, description: text(product.description?.html), category: "Adobe Commerce", price: amount.value, currency: "USD", image: product.small_image?.url, images, inStock: product.stock_status === "IN_STOCK" };
  });
}
function checkErrors(result: WishlistMutation) { if (result.user_errors?.length) throw new Error(result.user_errors.map((error) => error.message).join("; ")); return result.wishlist; }

export function getWishlist() { return readLocal(); }
export async function fetchWishlist(): Promise<Product[]> {
  const token = getCustomerToken();
  if (!token) return readLocal();
  const data = await adobeGraphQl<{ customer: { wishlists: AdobeWishlist[] } }>(CUSTOMER_WISHLISTS_QUERY, {}, false, token);
  let wishlist = data.customer.wishlists[0];
  if (!wishlist) {
    const created = await adobeGraphQl<{ createWishlist: WishlistMutation }>(CREATE_WISHLIST_MUTATION, { name: "Favorites" }, false, token);
    wishlist = checkErrors(created.createWishlist);
  }
  return normalizeWishlist(wishlist);
}
export function isInWishlist(sku: string, items?: Product[]) { return (items || (isAuthenticated() ? commerceQueryClient.getQueryData<Product[]>(commerceQueryKeys.wishlist()) || [] : readLocal())).some((item) => item.sku === sku); }
export function addToWishlist(product: Product) {
  if (!isAuthenticated()) return publishLocal([...readLocal().filter((item) => item.sku !== product.sku), product]);
  return runCommerceMutation(["commerce", "adobe", "wishlist", "add"], async (sku: string) => {
    if (!remoteWishlistId) await fetchWishlist();
    const data = await adobeGraphQl<{ addProductsToWishlist: WishlistMutation }>(ADD_TO_WISHLIST_MUTATION, { wishlistId: remoteWishlistId, items: [{ sku, quantity: 1 }] }, false, getCustomerToken() || undefined);
    return normalizeWishlist(checkErrors(data.addProductsToWishlist));
  }, product.sku).then((items) => { commerceQueryClient.setQueryData(commerceQueryKeys.wishlist(), items); return items; });
}
export function removeFromWishlist(sku: string) {
  if (!isAuthenticated()) return publishLocal(readLocal().filter((item) => item.sku !== sku));
  return runCommerceMutation(["commerce", "adobe", "wishlist", "remove"], async () => {
    if (!remoteWishlistId || !remoteItemIds.has(sku)) await fetchWishlist();
    const itemId = remoteItemIds.get(sku);
    if (!itemId) return commerceQueryClient.getQueryData<Product[]>(commerceQueryKeys.wishlist()) || [];
    const data = await adobeGraphQl<{ removeProductsFromWishlist: WishlistMutation }>(REMOVE_FROM_WISHLIST_MUTATION, { wishlistId: remoteWishlistId, itemIds: [itemId] }, false, getCustomerToken() || undefined);
    return normalizeWishlist(checkErrors(data.removeProductsFromWishlist));
  }, undefined).then((items) => { commerceQueryClient.setQueryData(commerceQueryKeys.wishlist(), items); return items; });
}
export function toggleWishlist(product: Product, items?: Product[]) { return isInWishlist(product.sku, items) ? removeFromWishlist(product.sku) : addToWishlist(product); }
export function useWishlist() {
  const authenticated = isAuthenticated();
  const [localItems, setLocalItems] = useState(readLocal);
  useEffect(() => { const update = () => setLocalItems(readLocal()); window.addEventListener(eventName, update); window.addEventListener("storage", update); return () => { window.removeEventListener(eventName, update); window.removeEventListener("storage", update); }; }, []);
  const remote = useQuery({ queryKey: commerceQueryKeys.wishlist(), queryFn: fetchWishlist, enabled: authenticated, staleTime: 30_000 });
  return { items: authenticated ? remote.data || [] : localItems, error: remote.error, isPending: authenticated && remote.isPending };
}
