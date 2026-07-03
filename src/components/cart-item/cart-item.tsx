import type { CartItem as CartItemType } from "@models/cart";

type CartItemProps = {
  item: CartItemType;
  compact?: boolean;
  priority?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
};

export function CartItem({ item, compact = false, priority = false, onQuantityChange, onRemove }: CartItemProps) {
  const initials = item.name.split(" ").map((word) => word[0]).slice(0, 2).join("");

  return (
    <article class={`cart-item ${compact ? "cart-item-compact" : ""}`}>
      <div class="cart-item-media" aria-hidden="true">
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
      </div>
      <div class="cart-item-content">
        <div class="cart-item-heading">
          <h3>{item.name}</h3>
          <strong>${item.price.toLocaleString()}</strong>
        </div>
        {item.options?.length ? (
          <p class="cart-item-options">{item.options.join(" · ")}</p>
        ) : null}
        <div class="cart-item-controls">
          {onQuantityChange ? (
            <label><span>Quantity</span><select value={item.quantity} onChange={(event) => onQuantityChange(Number(event.currentTarget.value))}>{[1, 2, 3, 4, 5].map((value) => <option key={value}>{value}</option>)}</select></label>
          ) : <span class="cart-item-quantity">Quantity {item.quantity}</span>}
          {onRemove ? <button type="button" class="cart-item-remove" onClick={onRemove}>Remove</button> : null}
        </div>
      </div>
    </article>
  );
}
