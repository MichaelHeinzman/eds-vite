import { useEffect, useState } from "preact/hooks";

import { CartItem } from "@components/cart-item/cart-item";
import { Modal } from "@components/modal/modal";
import { getCart, removeCartItem, subscribeCart, updateCartItem } from "@services/cart";
import type { Cart } from "@models/cart";

type MiniCartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeCart((data) => { if (mounted) setCart(data); });
    if (isOpen) getCart().then((data) => { if (mounted) setCart(data); });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} title="Cart" position="right" onClose={onClose}>
      {!cart ? (
        <div class="minicart-loading" aria-live="polite">
          <sp-progress-circle indeterminate size="l" />
          <span>Loading cart…</span>
        </div>
      ) : (
        <div class="minicart">
          <p class="minicart-count">{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in your cart</p>

          <div class="minicart-items">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} compact onQuantityChange={(quantity) => updateCartItem(item.id, quantity)} onRemove={() => removeCartItem(item.id)} />
            ))}
            {!cart.items.length ? <div class="empty-cart"><h3>Your cart is empty</h3><a href="/products">Browse products</a></div> : null}
          </div>

          <footer class="minicart-footer">
            <div class="minicart-subtotal">
              <div><strong>Subtotal</strong><small>Taxes and delivery calculated at checkout</small></div>
              <strong>${cart.subtotal.toLocaleString()}</strong>
            </div>

            <a class="spectrum-Button spectrum-Button--accent" href="/cart">
              View Cart
            </a>
          </footer>
        </div>
      )}
    </Modal>
  );
}
