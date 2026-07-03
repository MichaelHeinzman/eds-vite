import { useQuery } from "@tanstack/react-query";

import { getAdobeCommerceConfig, isAdobeCommerceConfigured } from "@services/adobe-config";
import { adobeGraphQl, CATALOG_PRODUCT_QUERY, CATALOG_PRODUCTS_QUERY, CATALOG_VARIANTS_QUERY, CORE_PRODUCT_QUERY, CORE_PRODUCTS_QUERY } from "@services/adobe-graphql";
import { commerceQueryClient, commerceQueryKeys } from "@services/query-client";
import type { Product } from "@/types/catalog";

type CorePrice = { minimum_price: { final_price: { value: number; currency: string } } };
type CoreVariantProduct = { sku: string; stock_status: string; small_image?: { url: string }; price_range: CorePrice };
type CoreProduct = { sku: string; name: string; stock_status: string; description?: { html: string }; small_image?: { url: string }; media_gallery?: Array<{ url: string }>; price_range: CorePrice; configurable_options?: Array<{ attribute_code: string; label: string; values: Array<{ value_index: number; label: string; swatch_data?: { value: string } }> }>; variants?: Array<{ attributes: Array<{ code: string; value_index: number }>; product: CoreVariantProduct }> };
type CatalogAmount = { amount: { value: number; currency: string } };
type CatalogPrice = { final?: CatalogAmount; regular?: CatalogAmount };
type CatalogOptionValue = { id: string; title: string; inStock: boolean; value?: string; product?: CatalogProduct };
type CatalogOption = { id: string; title: string; required: boolean; values: CatalogOptionValue[] };
type CatalogProduct = { sku: string; name: string; description?: string; shortDescription?: string; inStock: boolean; images?: Array<{ url: string }>; price?: CatalogPrice; priceRange?: { minimum?: CatalogPrice; maximum?: CatalogPrice }; options?: CatalogOption[] };
type CatalogVariant = { selections: string[]; product: CatalogProduct };

function text(html = "") { const element = document.createElement("div"); element.innerHTML = html.replace(/<br\s*\/?>/gi, " ").replace(/<\/(div|p|li|ul|ol|h[1-6])>/gi, " $&"); return (element.textContent || "").replace(/\s+/g, " ").trim(); }
function adaptCoreProduct(product: CoreProduct): Product { return { id: product.sku, sku: product.sku, name: product.name, description: text(product.description?.html), category: "Adobe Commerce", price: product.price_range.minimum_price.final_price.value, currency: "USD", image: product.small_image?.url, images: product.media_gallery?.map((image) => image.url) || (product.small_image?.url ? [product.small_image.url] : []), inStock: product.stock_status === "IN_STOCK", options: product.configurable_options?.map((option) => ({ id: option.attribute_code, title: option.label, required: true, values: option.values.map((value) => ({ id: String(value.value_index), title: value.label, inStock: true, swatch: value.swatch_data?.value })) })), variants: product.variants?.map((variant) => ({ sku: variant.product.sku, selections: variant.attributes.map((attribute) => String(attribute.value_index)), price: variant.product.price_range.minimum_price.final_price.value, image: variant.product.small_image?.url, inStock: variant.product.stock_status === "IN_STOCK" })) }; }
function catalogAmount(product: CatalogProduct) { return product.price?.final?.amount || product.price?.regular?.amount || product.priceRange?.minimum?.final?.amount || product.priceRange?.minimum?.regular?.amount; }
function adaptCatalogProduct(product: CatalogProduct, variants: CatalogVariant[] = []) : Product {
  const optionVariants = product.options?.flatMap((option) => option.values.filter((value) => value.product).map((value) => ({ selections: [value.id], product: value.product as CatalogProduct }))) || [];
  const resolvedVariants = variants.length ? variants : optionVariants;
  const amount = catalogAmount(product);
  return { id: product.sku, sku: product.sku, name: product.name, description: text(product.description || product.shortDescription), category: "Adobe Catalog Service", price: amount?.value || 0, currency: "USD", image: product.images?.[0]?.url, images: product.images?.map((image) => image.url) || [], inStock: product.inStock, options: product.options?.map((option) => ({ id: option.id, title: option.title, required: option.required, values: option.values.map((value) => ({ id: value.id, title: value.title, inStock: value.inStock, swatch: value.value })) })), variants: resolvedVariants.map((variant) => ({ sku: variant.product.sku, selections: variant.selections, price: catalogAmount(variant.product)?.value, image: variant.product.images?.[0]?.url, inStock: variant.product.inStock })) };
}

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
    return data.products.map((product) => adaptCatalogProduct(product));
  }
  const data = await adobeGraphQl<{ products: { items: CoreProduct[] } }>(CORE_PRODUCTS_QUERY, { search: "", pageSize: 24, currentPage: 1 });
  return data.products.items.map(adaptCoreProduct);
}

async function fetchAdobeProduct(id: string) {
  const config = getAdobeCommerceConfig();
  if (!isAdobeCommerceConfigured(config)) throw new Error("Adobe Commerce is not configured.");
  if (config.catalogMode === "catalog-service") {
    const data = await adobeGraphQl<{ products: CatalogProduct[] }>(CATALOG_PRODUCT_QUERY, { skus: [id] }, true);
    const product = data.products[0];
    if (!product) return null;
    let variants: CatalogVariant[] = [];
    if (product.options?.length) {
      try {
        const variantData = await adobeGraphQl<{ variants: { variants: CatalogVariant[] } }>(CATALOG_VARIANTS_QUERY, { sku: id }, true);
        variants = variantData.variants.variants;
      } catch (error) {
        console.warn(`Unable to load variants for ${id}`, error);
      }
    }
    return adaptCatalogProduct(product, variants);
  }
  const data = await adobeGraphQl<{ products: { items: CoreProduct[] } }>(CORE_PRODUCT_QUERY, { sku: id });
  return data.products.items[0] ? adaptCoreProduct(data.products.items[0]) : null;
}

export function getProducts() {
  return commerceQueryClient.ensureQueryData(productsQueryOptions());
}

function productsQueryOptions() {
  return {
    queryKey: commerceQueryKeys.products(),
    queryFn: fetchAdobeProducts,
    staleTime: 1000 * 60 * 5,
  };
}

export function useProducts() {
  return useQuery(productsQueryOptions());
}

export function getProduct(id: string) {
  return commerceQueryClient.ensureQueryData(productQueryOptions(id));
}

function productQueryOptions(id: string) {
  return {
    queryKey: commerceQueryKeys.product(id),
    queryFn: () => fetchAdobeProduct(id),
    staleTime: 1000 * 60 * 5,
  };
}

export function useProduct(id: string) {
  return useQuery(productQueryOptions(id));
}
