import { useQuery } from "@tanstack/react-query";

import { getAdobeCommerceConfig, isAdobeCommerceConfigured } from "@services/adobe-config";
import { adobeGraphQl, CATALOG_PRODUCT_QUERY, CATALOG_PRODUCT_SEARCH_QUERY, CATALOG_PRODUCTS_QUERY, CATALOG_VARIANTS_QUERY, CORE_PRODUCT_QUERY, CORE_PRODUCT_SEARCH_QUERY, CORE_PRODUCTS_QUERY } from "@services/adobe-graphql";
import { commerceQueryClient, commerceQueryKeys } from "@services/query-client";
import type { Product, ProductFacet, ProductSearchCriteria, ProductSearchResult } from "@/types/catalog";

type CorePrice = { minimum_price: { final_price: { value: number; currency: string } } };
type CoreVariantProduct = { sku: string; stock_status: string; small_image?: { url: string }; price_range: CorePrice };
type CoreProduct = { sku: string; name: string; stock_status: string; description?: { html: string }; small_image?: { url: string }; media_gallery?: Array<{ url: string }>; price_range: CorePrice; configurable_options?: Array<{ attribute_code: string; label: string; values: Array<{ value_index: number; label: string; swatch_data?: { value: string } }> }>; variants?: Array<{ attributes: Array<{ code: string; value_index: number }>; product: CoreVariantProduct }> };
type CatalogAmount = { amount: { value: number; currency: string } };
type CatalogPrice = { final?: CatalogAmount; regular?: CatalogAmount };
type CatalogOptionValue = { id: string; title: string; inStock: boolean; value?: string; product?: CatalogProduct };
type CatalogOption = { id: string; title: string; required: boolean; values: CatalogOptionValue[] };
type CatalogProduct = { sku: string; name: string; description?: string; shortDescription?: string; inStock: boolean; images?: Array<{ url: string }>; price?: CatalogPrice; priceRange?: { minimum?: CatalogPrice; maximum?: CatalogPrice }; options?: CatalogOption[] };
type CatalogVariant = { selections: string[]; product: CatalogProduct };
type CoreAggregation = { attribute_code: string; label: string; options: Array<{ label: string; value: string; count: number }> };
type CatalogFacet = { title: string; attribute: string; buckets: Array<{ __typename?: string; title: string; name?: string; path?: string; count?: number; from?: number; to?: number | null; min?: number; max?: number }> };

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

function coreFilters(criteria: ProductSearchCriteria) { return Object.fromEntries([...Object.entries(criteria.filters).filter(([, values]) => values.length).map(([attribute, values]) => [attribute, values.length === 1 ? { eq: values[0] } : { in: values }]), ...Object.entries(criteria.ranges).map(([attribute, range]) => [attribute, { ...(range.from !== undefined ? { from: String(range.from) } : {}), ...(range.to !== undefined ? { to: String(range.to) } : {}) }])]); }
function coreSort(sort: ProductSearchCriteria["sort"]) { if (sort === "price-asc") return { price: "ASC" }; if (sort === "price-desc") return { price: "DESC" }; if (sort === "name") return { name: "ASC" }; return undefined; }
function catalogFilters(criteria: ProductSearchCriteria) { return [...Object.entries(criteria.filters).filter(([, values]) => values.length).map(([attribute, values]) => ({ attribute, in: values })), ...Object.entries(criteria.ranges).map(([attribute, range]) => ({ attribute, range }))]; }
function catalogSort(sort: ProductSearchCriteria["sort"]) { if (sort === "price-asc") return [{ attribute: "price", direction: "ASC" }]; if (sort === "price-desc") return [{ attribute: "price", direction: "DESC" }]; if (sort === "name") return [{ attribute: "name", direction: "ASC" }]; return undefined; }
function parseRange(label: string) { const [from, rawTo] = label.split("-"); const to = rawTo === "*" ? undefined : Number(rawTo); return { from: Number(from), to: Number.isFinite(to) ? to : undefined }; }
function normalizeCoreFacets(aggregations: CoreAggregation[] = []): ProductFacet[] { return aggregations.filter((facet) => facet.options?.length).map((facet) => { const rangeOptions = facet.attribute_code === "price" ? facet.options.map((option) => parseRange(option.value || option.label)) : []; const interval = rangeOptions.length > 1 ? (rangeOptions[1].from - rangeOptions[0].from) : 1; return { attribute: facet.attribute_code, title: facet.label, kind: facet.attribute_code === "price" ? "range" : "scalar", options: facet.attribute_code === "price" ? [] : facet.options.map((option) => ({ value: option.value, title: option.label, count: option.count })), ...(facet.attribute_code === "price" ? { min: Math.min(...rangeOptions.map((range) => range.from)), max: Math.max(...rangeOptions.map((range) => range.to ?? range.from + interval)) } : {}) }; }); }
function normalizeCatalogFacets(facets: CatalogFacet[] = []): ProductFacet[] { return facets.map((facet) => { const ranges = facet.buckets.filter((bucket) => bucket.__typename === "RangeBucket"); const interval = ranges.length > 1 ? (ranges[1].from! - ranges[0].from!) : 1; const stats = facet.buckets.find((bucket) => bucket.__typename === "StatsBucket"); if (ranges.length || stats) return { attribute: facet.attribute, title: facet.title, kind: "range" as const, options: [], min: stats?.min ?? Math.min(...ranges.map((bucket) => bucket.from!)), max: stats?.max ?? Math.max(...ranges.map((bucket) => bucket.to ?? bucket.from! + interval)) }; return { attribute: facet.attribute, title: facet.title, kind: "scalar" as const, options: facet.buckets.filter((bucket) => bucket.count !== undefined).map((bucket) => ({ value: bucket.path || bucket.title, title: bucket.name || bucket.title, count: bucket.count || 0 })) }; }).filter((facet) => facet.kind === "range" ? Number.isFinite(facet.min) && Number.isFinite(facet.max) : facet.options.length); }

export async function fetchProductSearch(criteria: ProductSearchCriteria): Promise<ProductSearchResult> {
  const config = getAdobeCommerceConfig();
  if (!isAdobeCommerceConfigured(config)) throw new Error("Adobe Commerce is not configured.");
  if (config.catalogMode === "catalog-service") {
    const search = await adobeGraphQl<{ productSearch: { total_count: number; items: Array<{ productView: CatalogProduct }>; facets: CatalogFacet[] } }>(CATALOG_PRODUCT_SEARCH_QUERY, { phrase: criteria.phrase, filter: catalogFilters(criteria), sort: catalogSort(criteria.sort), pageSize: 24, currentPage: 1 }, true);
    return { products: search.productSearch.items.map((item) => adaptCatalogProduct(item.productView)), facets: normalizeCatalogFacets(search.productSearch.facets), total: search.productSearch.total_count };
  }
  const data = await adobeGraphQl<{ products: { total_count: number; items: CoreProduct[]; aggregations: CoreAggregation[] } }>(CORE_PRODUCT_SEARCH_QUERY, { search: criteria.phrase, filter: coreFilters(criteria), sort: coreSort(criteria.sort), pageSize: 24, currentPage: 1 });
  return { products: data.products.items.map(adaptCoreProduct), facets: normalizeCoreFacets(data.products.aggregations), total: data.products.total_count };
}

function productSearchOptions(criteria: ProductSearchCriteria) { return { queryKey: commerceQueryKeys.productSearch(criteria), queryFn: () => fetchProductSearch(criteria), staleTime: 60_000 }; }
export function getProductSearch(criteria: ProductSearchCriteria) { return commerceQueryClient.ensureQueryData(productSearchOptions(criteria)); }
export function useProductSearch(criteria: ProductSearchCriteria) { return useQuery({ ...productSearchOptions(criteria), placeholderData: (previous: ProductSearchResult | undefined) => previous }); }

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
