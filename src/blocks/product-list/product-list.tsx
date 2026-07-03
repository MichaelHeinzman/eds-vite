import { render } from "preact";
import "./product-list.css";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import type { ProductFacet, ProductSearchCriteria } from "@/types/catalog";
import { ProductCard } from "@components/product-card/product-card";
import { ProductGridSkeleton } from "@components/loading-skeleton/loading-skeleton";
import { Modal } from "@components/modal/modal";
import { getProductSearch, useProductSearch } from "@services/products";
import { CommerceQueryProvider } from "@services/query-client";
import { setProductListSchema } from "@utils/structured-data";

type SortOrder = ProductSearchCriteria["sort"];
export type ProductFilters = { query: string; sort: SortOrder; filters: Record<string, string[]>; ranges: Record<string, { from?: number; to?: number }> };
export function readProductFilters(search = window.location.search): ProductFilters {
  const params = new URLSearchParams(search); const filters: Record<string, string[]> = {}; const ranges: Record<string, { from?: number; to?: number }> = {};
  params.forEach((value, key) => { const match = /^filter\[([^\]]+)\]$/.exec(key); const range = /^range\[([^\]]+)\]\[(from|to)\]$/.exec(key); if (match) filters[match[1]] = [...(filters[match[1]] || []), value]; if (range) ranges[range[1]] = { ...ranges[range[1]], [range[2]]: Number(value) }; });
  return { query: params.get("q") || "", sort: (params.get("sort") as SortOrder) || "featured", filters, ranges };
}
export function serializeProductFilters(state: ProductFilters) { const params = new URLSearchParams(); if (state.query) params.set("q", state.query); if (state.sort !== "featured") params.set("sort", state.sort); Object.entries(state.filters).sort(([a], [b]) => a.localeCompare(b)).forEach(([attribute, values]) => values.slice().sort().forEach((value) => params.append(`filter[${attribute}]`, value))); Object.entries(state.ranges).sort(([a], [b]) => a.localeCompare(b)).forEach(([attribute, range]) => { if (range.from !== undefined) params.set(`range[${attribute}][from]`, String(range.from)); if (range.to !== undefined) params.set(`range[${attribute}][to]`, String(range.to)); }); return params.toString(); }

function Facets({ facets, filters, ranges, onToggle, onRange }: { facets: ProductFacet[]; filters: Record<string, string[]>; ranges: ProductFilters["ranges"]; onToggle: (attribute: string, value: string) => void; onRange: (attribute: string, edge: "from" | "to", value: number, min: number, max: number) => void }) {
  return <div class="catalog-facets">{facets.map((facet) => <fieldset key={facet.attribute}><legend>{facet.title}</legend>{facet.kind === "range" && facet.min !== undefined && facet.max !== undefined ? <div class="facet-range"><div><output>${ranges[facet.attribute]?.from ?? facet.min}</output><span>–</span><output>${ranges[facet.attribute]?.to ?? facet.max}</output></div><label><span class="sr-only">Minimum {facet.title}</span><input type="range" min={facet.min} max={facet.max} step="0.01" value={ranges[facet.attribute]?.from ?? facet.min} onInput={(event) => onRange(facet.attribute, "from", Number(event.currentTarget.value), facet.min!, facet.max!)} /></label><label><span class="sr-only">Maximum {facet.title}</span><input type="range" min={facet.min} max={facet.max} step="0.01" value={ranges[facet.attribute]?.to ?? facet.max} onInput={(event) => onRange(facet.attribute, "to", Number(event.currentTarget.value), facet.min!, facet.max!)} /></label></div> : facet.options.map((option) => <label key={option.value}><input type="checkbox" checked={filters[facet.attribute]?.includes(option.value) || false} onChange={() => onToggle(facet.attribute, option.value)} /><span>{option.title}</span><small>{option.count}</small></label>)}</fieldset>)}</div>;
}

function ProductList() {
  const initial = readProductFilters();
  const [query, setQuery] = useState(initial.query); const [phrase, setPhrase] = useState(initial.query);
  const [sort, setSort] = useState<SortOrder>(initial.sort); const [filters, setFilters] = useState(initial.filters); const [ranges, setRanges] = useState(initial.ranges);
  const [filtersOpen, setFiltersOpen] = useState(false); const [showFloatingFilters, setShowFloatingFilters] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => setPhrase(query.trim()), 250); return () => window.clearTimeout(timer); }, [query]);
  const criteria = useMemo<ProductSearchCriteria>(() => ({ phrase, sort, filters, ranges }), [phrase, sort, filters, ranges]);
  const { data, error, isPending, isFetching } = useProductSearch(criteria); const products = data?.products || []; const facets = data?.facets || [];
  useEffect(() => { const params = serializeProductFilters({ query, sort, filters, ranges }); window.history.replaceState(null, "", `${window.location.pathname}${params ? `?${params}` : ""}`); }, [query, sort, filters, ranges]);
  useEffect(() => { if (products.length) setProductListSchema(products); }, [products]);
  useEffect(() => { const button = filterButtonRef.current; if (!button) return; const observer = new IntersectionObserver(([entry]) => setShowFloatingFilters(!entry.isIntersecting && entry.boundingClientRect.top < 0)); observer.observe(button); return () => observer.disconnect(); }, []);
  function toggle(attribute: string, value: string) { setFilters((current) => { const values = current[attribute] || []; const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; const updated = { ...current }; if (next.length) updated[attribute] = next; else delete updated[attribute]; return updated; }); }
  function setRange(attribute: string, edge: "from" | "to", value: number, min: number, max: number) { setRanges((current) => { const existing = current[attribute] || {}; const next = { from: existing.from ?? min, to: existing.to ?? max, [edge]: value }; if (next.from! > next.to!) next[edge === "from" ? "to" : "from"] = value; const updated = { ...current }; if (next.from === min && next.to === max) delete updated[attribute]; else updated[attribute] = next; return updated; }); }
  const activeFilterCount = Object.values(filters).reduce((count, values) => count + values.length, 0) + Object.keys(ranges).length;
  const filterLabel = `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`;

  return <div class="catalog-page">
    <header class="catalog-heading"><div><p class="page-eyebrow">Shop</p><h1>Explore the collection</h1><p class="page-lead">Products and facets from the configured Adobe Commerce catalog source.</p></div><span>{data?.total ?? 0} products</span></header>
    <div class="catalog-toolbar">
      <label><span>Search products</span><input type="search" value={query} placeholder="Search products" onInput={(event) => setQuery(event.currentTarget.value)} /></label>
      <label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.currentTarget.value as SortOrder)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select></label>
      <div class="catalog-filter-trigger" ref={filterButtonRef}><sp-button size="m" variant="secondary" onClick={() => setFiltersOpen(true)}>{filterLabel}</sp-button></div>
      {isFetching ? <span class="catalog-refresh" role="status">Updating…</span> : null}
    </div>
    <div class="catalog-results-layout">
      {facets.length ? <aside class="catalog-facets-desktop" aria-label="Product filters"><Facets facets={facets} filters={filters} ranges={ranges} onToggle={toggle} onRange={setRange} /></aside> : null}
      <div class="catalog-results">{isPending ? <div class="skeleton-loading" role="status"><ProductGridSkeleton /></div> : error ? <div class="catalog-empty"><h2>Catalog unavailable</h2><p>{error.message}</p><a href="/commerce-settings">Configure Adobe Commerce</a></div> : products.length ? <div class="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div> : <div class="catalog-empty"><h2>No products found</h2><p>Try removing a filter or changing your search.</p></div>}</div>
    </div>
    {facets.length ? <Modal isOpen={filtersOpen} title="Filters" position="bottom" onClose={() => setFiltersOpen(false)}><div aria-label="Product filters"><Facets facets={facets} filters={filters} ranges={ranges} onToggle={toggle} onRange={setRange} /></div><sp-button class="catalog-filter-done" size="l" onClick={() => setFiltersOpen(false)}>Show {data?.total ?? 0} products</sp-button></Modal> : null}
    {facets.length && showFloatingFilters ? <sp-button class="catalog-floating-filters" size="l" onClick={() => setFiltersOpen(true)}>{filterLabel}</sp-button> : null}
  </div>;
}

export default async function decorate(block: HTMLElement) {
  const initial = readProductFilters(); block.dataset.blockLoadingUi = "true";
  render(<div class="skeleton-loading" role="status" aria-label="Loading products"><ProductGridSkeleton /></div>, block);
  await getProductSearch({ phrase: initial.query, sort: initial.sort, filters: initial.filters, ranges: initial.ranges }).catch(() => undefined);
  render(<CommerceQueryProvider><ProductList /></CommerceQueryProvider>, block); delete block.dataset.blockLoadingUi;
}
