import { QueryClient } from "@tanstack/query-core";

import { getAdobeCommerceConfig, isAdobeCommerceConfigured } from "@services/adobe-config";
import { adobeGraphQl, CATALOG_PRODUCTS_QUERY, CORE_PRODUCT_QUERY, CORE_PRODUCTS_QUERY } from "@services/adobe-graphql";
import type { Product } from "@/types/catalog";

const productQueryClient = new QueryClient();

type CoreProduct = { sku: string; name: string; stock_status: string; description?: { html: string }; small_image?: { url: string }; media_gallery?: Array<{ url: string }>; price_range: { minimum_price: { final_price: { value: number; currency: string } } } };
type CatalogProduct = { sku: string; name: string; description?: string; shortDescription?: string; inStock: boolean; images?: Array<{ url: string }>; price?: { final?: { amount: { value: number; currency: string } }; regular?: { amount: { value: number; currency: string } } } };

function text(html = "") { const element = document.createElement("div"); element.innerHTML = html; return element.textContent?.trim() || ""; }
function adaptCoreProduct(product: CoreProduct): Product { return { id: product.sku, sku: product.sku, name: product.name, description: text(product.description?.html), category: "Adobe Commerce", price: product.price_range.minimum_price.final_price.value, currency: "USD", image: product.small_image?.url, images: product.media_gallery?.map((image) => image.url) || (product.small_image?.url ? [product.small_image.url] : []), inStock: product.stock_status === "IN_STOCK" }; }
function adaptCatalogProduct(product: CatalogProduct): Product { const amount = product.price?.final?.amount || product.price?.regular?.amount; return { id: product.sku, sku: product.sku, name: product.name, description: product.description || product.shortDescription || "", category: "Adobe Catalog Service", price: amount?.value || 0, currency: "USD", image: product.images?.[0]?.url, images: product.images?.map((image) => image.url) || [], inStock: product.inStock }; }

async function fetchAdobeProducts() {
  const config = getAdobeCommerceConfig();
  if (!isAdobeCommerceConfigured(config)) throw new Error("Adobe Commerce is not configured.");
  if (config.catalogMode === "catalog-service") {
    let skus = config.catalogSkus;
    if (!skus.length) {
      const core = await adobeGraphQl<{ products: { items: CoreProduct[] } }>(CORE_PRODUCTS_QUERY, { search: "", pageSize: 24, currentPage: 1 });
      skus = core.products.items.map((product) => product.sku);
    }
    const data = await adobeGraphQl<{ products: CatalogProduct[] }>(CATALOG_PRODUCTS_QUERY, { skus }, true);
    return data.products.map(adaptCatalogProduct);
  }
  const data = await adobeGraphQl<{ products: { items: CoreProduct[] } }>(CORE_PRODUCTS_QUERY, { search: "", pageSize: 24, currentPage: 1 });
  return data.products.items.map(adaptCoreProduct);
}

async function fetchAdobeProduct(id: string) {
  const config = getAdobeCommerceConfig();
  if (!isAdobeCommerceConfigured(config)) throw new Error("Adobe Commerce is not configured.");
  if (config.catalogMode === "catalog-service") {
    const data = await adobeGraphQl<{ products: CatalogProduct[] }>(CATALOG_PRODUCTS_QUERY, { skus: [id] }, true);
    return data.products[0] ? adaptCatalogProduct(data.products[0]) : null;
  }
  const data = await adobeGraphQl<{ products: { items: CoreProduct[] } }>(CORE_PRODUCT_QUERY, { sku: id });
  return data.products.items[0] ? adaptCoreProduct(data.products.items[0]) : null;
}

export function getProducts() {
  return productQueryClient.ensureQueryData({
    queryKey: ["commerce", "adobe", "products", getAdobeCommerceConfig().catalogMode],
    queryFn: fetchAdobeProducts,
    staleTime: 1000 * 60 * 5,
  });
}

export function getProduct(id: string) {
  return productQueryClient.ensureQueryData({
    queryKey: ["commerce", "adobe", "product", id, getAdobeCommerceConfig().catalogMode],
    queryFn: () => fetchAdobeProduct(id),
    staleTime: 1000 * 60 * 5,
  });
}
