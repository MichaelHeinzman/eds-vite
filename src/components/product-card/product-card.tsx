import type { Product } from "@/types/catalog";
import "./product-card.css";
import { WishlistButton } from "@components/wishlist-button/wishlist-button";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const initials = product.name.split(" ").map((word) => word[0]).slice(0, 2).join("");

  return (
    <article class="product-card">
      <WishlistButton product={product} compact />
      <a class="product-card-media" href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
        <span>{initials}</span>
        {product.image ? <img src={product.image} alt={product.name} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /> : null}
      </a>
      <div class="product-card-body">
        <div class="product-card-meta"><span>{product.category}</span>{product.rating ? <span>★ {product.rating.toFixed(1)}</span> : null}</div>
        <h2><a href={`/products/${product.id}`}>{product.name}</a></h2>
        <p>{product.description}</p>
        <div class="product-card-footer">
          <strong>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          <a class="button primary" href={`/products/${product.id}`}>View product</a>
        </div>
      </div>
    </article>
  );
}
