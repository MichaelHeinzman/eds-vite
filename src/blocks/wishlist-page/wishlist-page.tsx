import { render } from "preact";
import "./wishlist-page.css";
import { ProductCard } from "@components/product-card/product-card";
import { useWishlist } from "@services/wishlist";
import { CommerceQueryProvider } from "@services/query-client";

function WishlistPage() { const { items, error, isPending } = useWishlist(); if (isPending) return <p role="status">Loading your wishlist…</p>; return <div class="wishlist-page"><header class="catalog-heading"><div><p class="page-eyebrow">Favorites</p><h1>Your wishlist</h1></div><span>{items.length} saved</span></header>{error ? <div role="alert"><h2>Wishlist unavailable</h2><p>{error.message}</p></div> : items.length ? <div class="product-grid">{items.map((product) => <ProductCard key={product.sku} product={product} />)}</div> : <div class="catalog-empty"><h2>No saved products yet</h2><a href="/products">Browse products</a></div>}</div>; }
export default function decorate(block: HTMLElement) { render(<CommerceQueryProvider><WishlistPage /></CommerceQueryProvider>, block); }
