import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import { CartItem } from "@components/cart-item/cart-item";
import { getCart } from "@services/cart";
import type { Cart } from "@models/cart";

function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    let mounted = true;
    getCart().then((data) => {
      if (mounted) setCart(data);
    });
    return () => { mounted = false; };
  }, []);

  if (!cart) {
    return (
      <div class="cart-page-loading" aria-live="polite">
        <sp-progress-circle indeterminate size="l" />
        <span>Loading your cart…</span>
      </div>
    );
  }

  const delivery = 0;
  const estimatedTax = Math.round(cart.subtotal * 0.06);
  const estimatedTotal = cart.subtotal + delivery + estimatedTax;

  return (
    <div class="cart-page-content">
      <header class="cart-page-heading">
        <div>
          <p class="page-eyebrow">Your cart</p>
          <h1>Review your selections</h1>
        </div>
        <p>{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</p>
      </header>

      <div class="cart-page-layout">
        <section class="cart-page-items" aria-label="Cart items">
          {cart.items.map((item) => <CartItem key={item.id} item={item} />)}
          <div class="delivery-note">
            <strong>Free local delivery</strong>
            <span>White-glove delivery scheduling is available after checkout.</span>
          </div>
        </section>

        <aside class="order-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>${cart.subtotal.toLocaleString()}</dd></div>
            <div><dt>Estimated delivery</dt><dd>{delivery ? `$${delivery}` : "Free"}</dd></div>
            <div><dt>Estimated tax</dt><dd>${estimatedTax.toLocaleString()}</dd></div>
          </dl>
          <sp-divider size="s" />
          <div class="order-total"><strong>Estimated total</strong><strong>${estimatedTotal.toLocaleString()}</strong></div>
          <sp-button size="l">Proceed to checkout</sp-button>
          <a href="/">Continue shopping</a>
          <small>This is local mock data. No payment or order will be submitted.</small>
        </aside>
      </div>
    </div>
  );
}

export default function decorate(block: HTMLElement) {
  render(<CartPage />, block);
}
