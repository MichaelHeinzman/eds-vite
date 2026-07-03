import { render } from "preact";
import { useState } from "preact/hooks";

import { addProductToCart } from "@services/cart";
import { getProduct } from "@services/products";
import { ProductPageSkeleton } from "@components/loading-skeleton/loading-skeleton";
import type { Product } from "@/types/catalog";

function ProductPage({ product }: { product: Product | null }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (product === null) return <div class="catalog-empty"><h1>Product not found</h1><a href="/products">Return to products</a></div>;

  const initials = product.name.split(" ").map((word) => word[0]).slice(0, 2).join("");
  async function addToCart() {
    if (!product) return;
    await addProductToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }
  return (
    <div class="product-detail-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/products">Products</a><span>›</span><span>{product.name}</span></nav>
      <div class="product-detail-layout">
        <div class="product-detail-media"><span>{initials}</span>{product.image ? <img src={product.image} alt={product.name} loading="eager" fetchPriority="high" /> : null}</div>
        <div class="product-detail-info">
          <p class="page-eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <div class="product-detail-meta"><span>SKU {product.sku}</span>{product.rating ? <span>★ {product.rating.toFixed(1)}</span> : null}</div>
          <p class="product-detail-description">{product.description}</p>
          <strong class="product-detail-price">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          <p class={`stock-status ${product.inStock ? "in-stock" : "out-of-stock"}`}>{product.inStock ? "In stock and ready to ship" : "Currently unavailable"}</p>
          <div class="product-actions"><label><span>Quantity</span><select value={quantity} onChange={(event) => setQuantity(Number(event.currentTarget.value))}><option>1</option><option>2</option><option>3</option></select></label><sp-button size="l" disabled={!product.inStock} onClick={addToCart}>{added ? "Added to cart" : "Add to cart"}</sp-button></div>
          <div class={`add-confirmation ${added ? "visible" : ""}`} role="status">{quantity} {quantity === 1 ? "item" : "items"} added to your cart.</div>
          <div class="product-benefits"><div><strong>Free delivery</strong><span>On qualifying local orders</span></div><div><strong>Easy returns</strong><span>30-day return window</span></div></div>
        </div>
      </div>
    </div>
  );
}

export default async function decorate(block: HTMLElement) {
  const id = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-1) || "");
  block.dataset.blockLoadingUi = "true";
  render(<div class="skeleton-loading" role="status" aria-label="Loading product"><ProductPageSkeleton /></div>, block);
  try {
    render(<ProductPage product={await getProduct(id)} />, block);
  } catch {
    render(<ProductPage product={null} />, block);
  }
  delete block.dataset.blockLoadingUi;
}
