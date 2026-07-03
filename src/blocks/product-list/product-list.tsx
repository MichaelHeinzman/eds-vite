import { render } from "preact";
import { useMemo, useState } from "preact/hooks";

import { ProductCard } from "@components/product-card/product-card";
import { ProductGridSkeleton } from "@components/loading-skeleton/loading-skeleton";
import { getProducts, useProducts } from "@services/products";
import { CommerceQueryProvider } from "@services/query-client";

type SortOrder = "featured" | "price-asc" | "price-desc" | "name";

function ProductList() {
  const { data: products = [], error } = useProducts();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("featured");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? products.filter((product) => `${product.name} ${product.category} ${product.sku}`.toLowerCase().includes(normalizedQuery))
      : products;
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, query, sort]);

  return (
    <div class="catalog-page">
      <header class="catalog-heading">
        <div><p class="page-eyebrow">Shop</p><h1>Explore the collection</h1><p class="page-lead">Catalog data from the configured Adobe Commerce catalog source.</p></div>
        <span>{visibleProducts.length} products</span>
      </header>
      <div class="catalog-toolbar">
        <label><span>Search products</span><input type="search" value={query} placeholder="Search by name, category, or SKU" onInput={(event) => setQuery(event.currentTarget.value)} /></label>
        <label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.currentTarget.value as SortOrder)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select></label>
      </div>
      {error ? <div class="catalog-empty"><h2>Catalog unavailable</h2><p>{error.message}</p><a href="/commerce-settings">Configure Adobe Commerce</a></div> : null}
      {!error && visibleProducts.length ? <div class="product-grid">{visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div> : null}
      {!error && !visibleProducts.length ? <div class="catalog-empty"><h2>No products found</h2><p>Try a different search.</p></div> : null}
    </div>
  );
}

export default async function decorate(block: HTMLElement) {
  block.dataset.blockLoadingUi = "true";
  render(<div class="skeleton-loading" role="status" aria-label="Loading products"><ProductGridSkeleton /></div>, block);
  await getProducts().catch(() => undefined);
  render(<CommerceQueryProvider><ProductList /></CommerceQueryProvider>, block);
  delete block.dataset.blockLoadingUi;
}
