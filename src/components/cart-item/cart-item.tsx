import type { CartItem as CartItemType } from "@models/cart";

type CartItemProps = {
  item: CartItemType;
  compact?: boolean;
};

export function CartItem({ item, compact = false }: CartItemProps) {
  const initials = item.name.split(" ").map((word) => word[0]).slice(0, 2).join("");

  return (
    <article class={`cart-item ${compact ? "cart-item-compact" : ""}`}>
      <div class="cart-item-media" aria-hidden="true">
        <span>{initials}</span>
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      </div>
      <div class="cart-item-content">
        <div class="cart-item-heading">
          <h3>{item.name}</h3>
          <strong>${item.price.toLocaleString()}</strong>
        </div>
        {item.options?.length ? (
          <p class="cart-item-options">{item.options.join(" · ")}</p>
        ) : null}
        <span class="cart-item-quantity">Quantity {item.quantity}</span>
      </div>
    </article>
  );
}
