import { useEffect, useState } from "preact/hooks";

import { CartItem } from "@components/cart-item/cart-item";
import { Modal } from "@components/modal/modal";
import { getCart } from "@services/cart";
import type { Cart } from "@models/cart";

type MiniCartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    getCart().then((data) => {
      if (mounted) setCart(data);
    });

    return () => {
      mounted = false;
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
              <CartItem key={item.id} item={item} compact />
            ))}
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
