import { useState } from "preact/hooks";
import "./cart-item.css";
import type { CartItem as CartItemType } from "@/types/cart";
import type { Product } from "@/types/catalog";
import { WishlistButton } from "@components/wishlist-button/wishlist-button";

type CartItemProps = {
  item: CartItemType;
  compact?: boolean;
  priority?: boolean;
  onQuantityChange?: (quantity: number) => void | Promise<unknown>;
  onRemove?: () => void | Promise<unknown>;
};

export function CartItem({ item, compact = false, priority = false, onQuantityChange, onRemove }: CartItemProps) {
  const [pendingAction, setPendingAction] = useState<"quantity" | "remove" | null>(null);
  const [error, setError] = useState("");
  const initials = item.name.split(" ").map((word) => word[0]).slice(0, 2).join("");
  const product: Product = { id: item.sku, sku: item.sku, name: item.name, description: "", category: "", price: item.price, currency: "USD", image: item.image, images: item.image ? [item.image] : [], inStock: true };

  async function runAction(action: "quantity" | "remove", callback: () => void | Promise<unknown>) {
    setPendingAction(action);
    setError("");
    try { await callback(); }
    catch { setError("Cart update failed. Please try again."); }
    finally { setPendingAction(null); }
  }

  return (
    <article class={`cart-item ${compact ? "cart-item-compact" : ""}`}>
      <a class="cart-item-media" href={`/products/${encodeURIComponent(item.sku)}`} aria-label={`View ${item.name}`}>
        <span>{initials}</span>
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        ) : null}
      </a>
      <div class="cart-item-content">
        <div class="cart-item-heading">
          <h3><a href={`/products/${encodeURIComponent(item.sku)}`}>{item.name}</a></h3>
          <strong>${item.price.toLocaleString()}</strong>
        </div>
        <WishlistButton product={product} compact />
        {item.options?.length ? (
          <p class="cart-item-options">{item.options.join(" · ")}</p>
        ) : null}
        <div class="cart-item-controls">
          {onQuantityChange ? (
            <label><span>Quantity</span><select value={item.quantity} disabled={pendingAction !== null} onChange={(event) => runAction("quantity", () => onQuantityChange(Number(event.currentTarget.value)))}>{[1, 2, 3, 4, 5].map((value) => <option key={value}>{value}</option>)}</select></label>
          ) : <span class="cart-item-quantity">Quantity {item.quantity}</span>}
          {onRemove ? <button type="button" class="cart-item-remove" disabled={pendingAction !== null} onClick={() => runAction("remove", onRemove)}>{pendingAction === "remove" ? "Removing…" : "Remove"}</button> : null}
        </div>
        {pendingAction === "quantity" ? <small class="cart-item-status" role="status">Updating quantity…</small> : null}
        {error ? <small class="cart-item-status error" role="alert">{error}</small> : null}
      </div>
    </article>
  );
}
