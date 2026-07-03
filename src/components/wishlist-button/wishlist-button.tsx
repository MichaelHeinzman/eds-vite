import type { Product } from "@/types/catalog";
import "./wishlist-button.css";
import { isInWishlist, toggleWishlist, useWishlist } from "@services/wishlist";
import { useState } from "preact/hooks";

export function WishlistButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { items } = useWishlist();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const saved = isInWishlist(product.sku, items);
  async function toggle() { setPending(true); setError(""); try { await toggleWishlist(product, items); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update wishlist."); } finally { setPending(false); } }
  return <><button type="button" class={`wishlist-button ${compact ? "compact" : ""}`} aria-pressed={saved} aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-busy={pending} disabled={pending} onClick={toggle}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>
  </button>{error ? <small class="wishlist-error" role="alert">{error}</small> : null}</>;
}
