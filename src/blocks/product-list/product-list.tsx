import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import { ProductCard } from "@components/product-card/product-card";
import { getCommerceBackend } from "@services/cart";
import { getProducts } from "@services/products";
import type { Product } from "@/types/catalog";

type SortOrder = "featured" | "price-asc" | "price-desc" | "name";

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("featured");

  useEffect(() => {
    let mounted = true;
    getProducts().then((data) => {
      if (mounted) setProducts(data);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

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
        <div><p class="page-eyebrow">Shop</p><h1>Explore the collection</h1><p class="page-lead">Catalog data from {getCommerceBackend() === "adobe" ? "the local Adobe Commerce fixture" : "the live DummyJSON furniture API"}.</p></div>
        <span>{visibleProducts.length} products</span>
      </header>
      <div class="catalog-toolbar">
        <label><span>Search products</span><input type="search" value={query} placeholder="Search by name, category, or SKU" onInput={(event) => setQuery(event.currentTarget.value)} /></label>
        <label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.currentTarget.value as SortOrder)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select></label>
      </div>
      {loading ? <div class="catalog-loading"><sp-progress-circle indeterminate size="l" /><span>Loading products…</span></div> : null}
      {!loading && visibleProducts.length ? <div class="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : null}
      {!loading && !visibleProducts.length ? <div class="catalog-empty"><h2>No products found</h2><p>Try a different search.</p></div> : null}
    </div>
  );
}

export default function decorate(block: HTMLElement) { render(<ProductList />, block); }
