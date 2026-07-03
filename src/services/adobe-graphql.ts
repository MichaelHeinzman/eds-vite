import { getAdobeCommerceConfig } from "@services/adobe-config";

type GraphQlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export async function adobeGraphQl<T>(query: string, variables: Record<string, unknown> = {}, catalog = false): Promise<T> {
  const config = getAdobeCommerceConfig();
  const endpoint = catalog ? config.catalogGraphqlEndpoint : config.commerceGraphqlEndpoint;
  if (!endpoint) throw new Error("Adobe Commerce endpoint is not configured.");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (catalog) {
    headers["Magento-Customer-Group"] = config.customerGroup;
    headers["Magento-Environment-Id"] = config.environmentId;
    headers["Magento-Website-Code"] = config.websiteCode;
    headers["Magento-Store-Code"] = config.storeCode;
    headers["Magento-Store-View-Code"] = config.storeViewCode;
    if (config.apiKey) headers["X-Api-Key"] = config.apiKey;
  } else {
    headers.Store = config.storeViewCode;
    headers["Content-Currency"] = config.currency;
  }

  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  if (!response.ok) throw new Error(`Adobe Commerce request failed: ${response.status}`);
  const payload = (await response.json()) as GraphQlResponse<T>;
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("; "));
  if (!payload.data) throw new Error("Adobe Commerce returned no data.");
  return payload.data;
}

export const CORE_PRODUCTS_QUERY = `query Products($search: String, $pageSize: Int!, $currentPage: Int!) {
  products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
    items { uid sku name stock_status description { html } small_image { url label } price_range { minimum_price { regular_price { value currency } final_price { value currency } } } }
  }
}`;

export const CORE_PRODUCT_QUERY = `query Product($sku: String!) {
  products(filter: { sku: { eq: $sku } }, pageSize: 1) {
    items { uid sku name stock_status description { html } small_image { url label } media_gallery { url label } price_range { minimum_price { regular_price { value currency } final_price { value currency } } } }
  }
}`;

export const CATALOG_PRODUCTS_QUERY = `query CatalogProducts($skus: [String!]!) {
  products(skus: $skus) { __typename id externalId sku name description shortDescription inStock images(roles: ["image", "small_image", "thumbnail"]) { url label roles } ... on SimpleProductView { price { final { amount { value currency } } regular { amount { value currency } } } } }
}`;

export const CREATE_CART_MUTATION = `mutation { createGuestCart { cart { id } } }`;
export const ADD_TO_CART_MUTATION = `mutation Add($cartId: String!, $items: [CartItemInput!]!) { addProductsToCart(cartId: $cartId, cartItems: $items) { cart { id total_quantity } user_errors { code message } } }`;
export const UPDATE_CART_MUTATION = `mutation Update($cartId: String!, $items: [CartItemUpdateInput!]!) { updateCartItems(input: { cart_id: $cartId, cart_items: $items }) { cart { id total_quantity } } }`;
export const REMOVE_CART_MUTATION = `mutation Remove($cartId: String!, $itemId: ID!) { removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $itemId }) { cart { id total_quantity } } }`;
export const CART_QUERY = `query Cart($id: String!) { cart(cart_id: $id) { id total_quantity itemsV2 { total_count items { uid quantity product { uid sku name small_image { url label } } prices { price { value currency } row_total { value currency } } } } prices { subtotal_excluding_tax { value currency } grand_total { value currency } } } }`;
